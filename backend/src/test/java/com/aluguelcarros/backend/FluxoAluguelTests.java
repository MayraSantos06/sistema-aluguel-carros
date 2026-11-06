package com.aluguelcarros.backend;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.support.DependencyInjectionTestExecutionListener;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import tools.jackson.databind.ObjectMapper;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:fluxo;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "AGENTE_EMPRESA_LOGIN=empresa",
        "AGENTE_EMPRESA_SENHA=senha-apenas-de-teste",
        "AGENTE_BANCO_LOGIN=banco",
        "AGENTE_BANCO_SENHA=senha-apenas-de-teste"
})
@ActiveProfiles("criar-agentes")
@TestExecutionListeners(DependencyInjectionTestExecutionListener.class)
class FluxoAluguelTests {
    private static final String SENHA = "senha-apenas-de-teste";
    private static final String PERFIL = "/api/meu-cliente";
    private static final String PEDIDOS = "/api/meus-alugueis";
    private static final String GESTAO = "/api/alugueis";
    private static final String FROTA = "/api/automoveis";
    @Autowired WebApplicationContext context;
    @Autowired ObjectMapper json;
    private MockMvc mvc;

    @Test
    void sessaoSobreviveARecargaEAoSairDeixaDeAutenticar() throws Exception {
        mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
        cadastrar("sessao");
        var csrfInicial = chamar("GET", "/api/auth/csrf", null, null).andExpect(status().isOk()).andReturn();
        var sessao = (MockHttpSession) csrfInicial.getRequest().getSession(false);
        var token = json.readTree(csrfInicial.getResponse().getContentAsString());
        var login = MockMvcRequestBuilders.post("/api/auth/entrar").session(sessao)
                .header(token.get("headerName").asText(), token.get("token").asText())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"login\":\"sessao\",\"senha\":\"%s\"}".formatted(SENHA));
        mvc.perform(login).andExpect(status().isOk());
        mvc.perform(MockMvcRequestBuilders.get("/api/auth/me").session(sessao))
                .andExpect(status().isOk()).andExpect(jsonPath("$.login").value("sessao"));
        mvc.perform(MockMvcRequestBuilders.post("/api/auth/sair").session(sessao))
                .andExpect(status().isForbidden());
        mvc.perform(MockMvcRequestBuilders.post("/api/auth/sair").session(sessao)
                        .header(token.get("headerName").asText(), token.get("token").asText()))
                .andExpect(status().isNoContent());
        chamar("GET", "/api/auth/me", null, null).andExpect(status().isUnauthorized());
    }

    @Test
    void cicloDeAluguelComPermissoesEPersistencia() throws Exception {
        mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
        chamar("GET", PERFIL, null, null).andExpect(status().isUnauthorized());
        cadastrar("cliente");
        cadastrar("outro");
        cadastrar("banco_teste");
        chamar("GET", "/api/auth/me", "banco_teste", null).andExpect(jsonPath("$.perfil").value("CLIENTE"));
        chamar("GET", GESTAO, "banco_teste", null).andExpect(status().isForbidden());
        chamar("GET", "/api/auth/me", "banco", null).andExpect(jsonPath("$.perfil").value("BANCO"));
        chamar("GET", PERFIL, "banco", null).andExpect(status().isForbidden());
        chamar("GET", PERFIL, "cliente", null).andExpect(status().isNotFound());
        String perfil = """
                {"nome":"Cliente Teste","rg":"1234","cpf":"12345678901","profissao":"Analista",
                 "endereco":"Rua A","empregadores":[{"nome":"Empresa Teste","rendimento":1000.50}]}
                """;
        chamar("POST", PERFIL, "cliente", perfil).andExpect(status().isCreated());
        String quartoEmpregador = """
                [{"nome":"A","rendimento":1},{"nome":"B","rendimento":2},
                 {"nome":"C","rendimento":3},{"nome":"D","rendimento":4}]
                """.strip();
        chamar("PUT", PERFIL, "cliente", perfil.replace(
                "[{\"nome\":\"Empresa Teste\",\"rendimento\":1000.50}]", quartoEmpregador))
                .andExpect(status().isBadRequest());
        chamar("GET", PERFIL, "cliente", null).andExpect(jsonPath("$.empregadores[0].rendimento").value(1000.50));
        chamar("PUT", PERFIL, "cliente", perfil.replace("Rua A", "Rua B"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.endereco").value("Rua B"));
        String outroPerfil = perfil.replace("12345678901", "12345678902");
        chamar("POST", PERFIL, "outro", outroPerfil).andExpect(status().isCreated());
        chamar("DELETE", PERFIL, "outro", null).andExpect(status().isNoContent());
        chamar("GET", PERFIL, "outro", null).andExpect(status().isNotFound());
        chamar("POST", PERFIL, "outro", outroPerfil).andExpect(status().isCreated());

        String carro = """
                {"matricula":"TESTE-01","placa":"TST1A23","marca":"Marca","modelo":"Modelo","ano":2025}
                """;
        chamar("POST", FROTA, "cliente", carro).andExpect(status().isForbidden());
        long veiculo = id(chamar("POST", FROTA, "empresa", carro).andExpect(status().isCreated()));
        long avulso = id(chamar("POST", FROTA, "empresa",
                carro.replace("TESTE-01", "TESTE-02").replace("TST1A23", "TST2A23"))
                .andExpect(status().isCreated()));
        chamar("DELETE", FROTA + "/" + avulso, "empresa", null).andExpect(status().isNoContent());
        chamar("POST", FROTA, "empresa", carro).andExpect(status().isConflict());
        chamar("PUT", FROTA + "/" + veiculo, "empresa", carro.replace("Modelo", "Atualizado"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.modelo").value("Atualizado"));

        LocalDate inicio = LocalDate.now().plusDays(5);
        String datas = "{\"automovelId\":%d,\"dataInicio\":\"%s\",\"dataFim\":\"%s\"}"
                .formatted(veiculo, inicio, inicio.plusDays(2));
        long pedido = id(chamar("POST", PEDIDOS, "cliente", datas).andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDENTE")));
        long segundo = id(chamar("POST", PEDIDOS, "outro", datas).andExpect(status().isCreated()));
        String datasLivres = "{\"automovelId\":%d,\"dataInicio\":\"%s\",\"dataFim\":\"%s\"}"
                .formatted(veiculo, inicio.plusDays(3), inicio.plusDays(4));
        long semConflito = id(chamar("POST", PEDIDOS, "outro", datasLivres).andExpect(status().isCreated()));
        String calendario = FROTA + "/" + veiculo + "/reservas";
        chamar("GET", calendario, null, null).andExpect(status().isUnauthorized());
        chamar("GET", calendario, "outro", null).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
        chamar("GET", GESTAO, "empresa", null).andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value((int) pedido))
                .andExpect(jsonPath("$[1].id").value((int) segundo));
        chamar("GET", GESTAO + "/" + pedido, "banco", null).andExpect(status().isOk())
                .andExpect(jsonPath("$.cliente.empregadores[0].rendimento").value(1000.50));
        chamar("PATCH", GESTAO + "/" + segundo + "/status?status=APROVADO", "banco", null)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.containsString("chegou antes")));
        chamar("GET", PEDIDOS, "cliente", null).andExpect(jsonPath("$.length()").value(1));
        chamar("PUT", PEDIDOS + "/" + pedido, "outro", datas).andExpect(status().isNotFound());
        chamar("PUT", PEDIDOS + "/" + pedido, "cliente", datas).andExpect(status().isOk());
        chamar("PUT", GESTAO + "/" + pedido, "banco", datas).andExpect(status().isOk());
        chamar("DELETE", PERFIL, "cliente", null).andExpect(status().isConflict());
        chamar("DELETE", FROTA + "/" + veiculo, "empresa", null).andExpect(status().isConflict());
        String contrato = GESTAO + "/" + pedido + "/contrato";
        chamar("POST", contrato, "empresa", "{\"tipo\":\"CLIENTE\"}").andExpect(status().isConflict());
        chamar("PATCH", GESTAO + "/" + pedido + "/status?status=APROVADO&observacao=Favoravel", "empresa", null)
                .andExpect(status().isOk()).andExpect(jsonPath("$.agenteParecer").value("empresa"));
        chamar("GET", calendario, "outro", null).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].inicio").value(inicio.toString()))
                .andExpect(jsonPath("$[0].fim").value(inicio.plusDays(2).toString()))
                .andExpect(jsonPath("$[0].cliente").doesNotExist());
        chamar("POST", PEDIDOS, "outro", datas).andExpect(status().isConflict());
        chamar("GET", calendario, "empresa", null).andExpect(status().isOk())
                .andExpect(jsonPath("$[0].inicio").value(inicio.toString()));
        chamar("PUT", GESTAO + "/" + semConflito, "empresa", datas).andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.containsString("já está reservado")));
        chamar("GET", GESTAO + "/" + semConflito, "empresa", null).andExpect(status().isOk())
                .andExpect(jsonPath("$.dataInicio").value(inicio.plusDays(3).toString()));
        chamar("PATCH", PEDIDOS + "/" + pedido + "/cancelamento", "cliente", null)
                .andExpect(status().isConflict());
        chamar("PATCH", GESTAO + "/" + segundo + "/status?status=APROVADO", "banco", null)
                .andExpect(status().isConflict());
        chamar("GET", GESTAO + "/" + segundo, "empresa", null)
                .andExpect(jsonPath("$.status").value("RECUSADO"))
                .andExpect(jsonPath("$.agenteParecer").value("Sistema"));
        chamar("GET", PEDIDOS, "outro", null)
                .andExpect(jsonPath("$[?(@.status == 'RECUSADO')].observacaoParecer",
                        org.hamcrest.Matchers.hasItem(org.hamcrest.Matchers.containsString("datas sobrepostas"))));
        chamar("PATCH", PEDIDOS + "/" + semConflito + "/cancelamento", "outro", null)
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("CANCELADO"));
        chamar("POST", contrato, "empresa", "{\"tipo\":\"CLIENTE\"}")
                .andExpect(status().isOk()).andExpect(jsonPath("$.proprietario").value("Cliente Teste"))
                .andExpect(jsonPath("$.agenteContrato").value("empresa"));
        String credito = GESTAO + "/" + pedido + "/credito";
        chamar("POST", credito, "empresa", "{\"valor\":100}").andExpect(status().isForbidden());
        chamar("POST", credito, "banco", "{\"valor\":100}")
                .andExpect(status().isOk()).andExpect(jsonPath("$.bancoCredito").value("banco"));
        chamar("GET", PEDIDOS, "cliente", null).andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("APROVADO"))
                .andExpect(jsonPath("$[0].valorCredito").value(100));
    }

    private void cadastrar(String login) throws Exception {
        chamar("POST", "/api/auth/cadastro", null,
                "{\"login\":\"%s\",\"senha\":\"%s\"}".formatted(login, SENHA)).andExpect(status().isCreated());
    }

    private long id(ResultActions resposta) throws Exception {
        return json.readTree(resposta.andReturn().getResponse().getContentAsString()).get("id").asLong();
    }

    private ResultActions chamar(String metodo, String uri, String usuario, String corpo) throws Exception {
        var requisicao = MockMvcRequestBuilders.request(HttpMethod.valueOf(metodo), uri);
        if (!metodo.equals("GET")) requisicao.with(csrf());
        if (usuario != null) requisicao.with(httpBasic(usuario, SENHA));
        if (corpo != null) requisicao.contentType(MediaType.APPLICATION_JSON).content(corpo);
        return mvc.perform(requisicao);
    }
}
