-- Execute no PostgreSQL após a inicialização do backend.
-- Matrículas e placas são fictícias, para demonstração.
INSERT INTO public.automoveis (matricula, marca, modelo, ano, placa)
SELECT catalogo.matricula, catalogo.marca, catalogo.modelo, catalogo.ano, catalogo.placa
FROM (VALUES
    ('DEMO-RARO-01', 'Bugatti', 'Chiron Super Sport', 2022, 'VLR9A01'),
    ('DEMO-RARO-02', 'Ferrari', 'Daytona SP3', 2023, 'VLR9A02'),
    ('DEMO-RARO-03', 'Lamborghini', 'Sián FKP 37', 2021, 'VLR9A03'),
    ('DEMO-RARO-04', 'Porsche', '918 Spyder', 2015, 'VLR9A04'),
    ('DEMO-RARO-05', 'Koenigsegg', 'Jesko Attack', 2024, 'VLR9A05')
) AS catalogo (matricula, marca, modelo, ano, placa)
WHERE NOT EXISTS (
    SELECT 1
    FROM public.automoveis AS cadastrado
    WHERE lower(cadastrado.matricula) = lower(catalogo.matricula)
       OR lower(cadastrado.placa) = lower(catalogo.placa)
)
ON CONFLICT DO NOTHING;
