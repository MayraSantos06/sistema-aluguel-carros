package com.aluguelcarros.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.support.DependencyInjectionTestExecutionListener;

@SpringBootTest(properties = {
        "spring.config.import=",
        "spring.datasource.url=jdbc:h2:mem:autorent;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@TestExecutionListeners(DependencyInjectionTestExecutionListener.class)
class BackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
