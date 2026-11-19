package br.edu.ifce.ambientes_internos.integracao

import br.edu.ifce.ambientes_internos.TestApplication
import br.edu.ifce.ambientes_internos.TestSecurityConfig
import br.edu.ifce.ambientes_internos.model.domain.entity.ambientes.Localizacao
import br.edu.ifce.ambientes_internos.model.domain.entity.ambientes.SalaAula
import br.edu.ifce.ambientes_internos.model.domain.entity.ambientes.enums.StatusAmbiente
import br.edu.ifce.ambientes_internos.model.repository.AmbienteRepository
import br.edu.ifce.ambientes_internos.model.repository.BlocoRepository
import br.edu.ifce.ambientes_internos.model.repository.CampusRepository
import br.edu.ifce.ambientes_internos.model.repository.UnidadeRepository
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.http.HttpHeaders
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.math.BigDecimal
import java.util.UUID

@SpringBootTest(classes = [TestApplication::class])
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestSecurityConfig::class)
@DisplayName("Testes de integração de segurança das rotas de ambientes")
class AmbienteSegurancaRotasIntegrationTest {

    @Autowired
    lateinit var mockMvc: MockMvc

    @Autowired
    lateinit var repoAmb: AmbienteRepository

    @Autowired
    lateinit var repoCampus: CampusRepository

    @Autowired
    lateinit var repoUnidade: UnidadeRepository

    @Autowired
    lateinit var repoBloco: BlocoRepository

    @Test
    fun `deve permitir acesso anonimo a hierarquia publicada`() {
        mockMvc.perform(
            get("/api/ambientes/publicados/campus")
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isOk)
    }

    @Test
    fun `deve negar acesso anonimo ao detalhe de ambiente publicado`() {
        val id = criarAmbientePublicado()

        mockMvc.perform(
            get("/api/ambientes/publicados/$id")
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isUnauthorized)
    }

    @Test
    fun `deve permitir acesso ao detalhe de ambiente publicado com jwt de colaborador`() {
        val id = criarAmbientePublicado()

        mockMvc.perform(
            get("/api/ambientes/publicados/$id")
                .with(jwtComRoles("ROLE_COLABORADOR"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isOk)
    }

    private fun criarAmbientePublicado(): Long {
        val sufixo = UUID.randomUUID().toString().take(8)
        val campus = criarCampus(repoCampus, "CAMPUS SEGURANCA $sufixo")
        val unidade = criarUnidade(repoCampus, repoUnidade, campus.nome, "UNIDADE $sufixo")
        val bloco = criarBloco(repoBloco, unidade, "BLOCO $sufixo")
        val sala = SalaAula(
            nome = "SALA $sufixo",
            localizacao = Localizacao(bloco = bloco, andar = 0),
            capacidade = 20,
            geometrias = mutableSetOf(),
            pesDireitos = mutableSetOf(BigDecimal("3.0")),
            esquadrias = mutableSetOf(),
        )
        sala.status = StatusAmbiente.PUBLICADO
        return repoAmb.save(sala).id!!
    }

    @Test
    fun `deve permitir acesso aos ambientes publicados com jwt de colaborador`() {
        mockMvc.perform(
            get("/api/ambientes/publicados")
                .with(jwtComRoles("ROLE_COLABORADOR"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isOk)
    }

    @Test
    fun `deve permitir acesso aos ambientes publicados por tipo com jwt de colaborador`() {
        mockMvc.perform(
            get("/api/ambientes/publicados/tipo")
                .param("tipo", "SALA_AULA")
                .param("page", "0")
                .param("size", "20")
                .with(jwtComRoles("ROLE_COLABORADOR"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isOk)
    }

    @Test
    fun `deve permitir acesso aos ambientes publicados por nome com jwt de colaborador`() {
        mockMvc.perform(
            get("/api/ambientes/publicados/nome")
                .param("nome", "Sala")
                .param("page", "0")
                .param("size", "20")
                .with(jwtComRoles("ROLE_COLABORADOR"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isOk)
    }

    @Test
    fun `deve permitir acesso aos ambientes publicados por localizacao com jwt de colaborador`() {
        mockMvc.perform(
            get("/api/ambientes/publicados/localizacao")
                .param("campusId", "1")
                .param("unidadeId", "1")
                .param("blocoId", "1")
                .param("andar", "1")
                .param("page", "0")
                .param("size", "20")
                .with(jwtComRoles("ROLE_COLABORADOR"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isOk)
    }

    @Test
    fun `deve negar acesso aos ambientes nao publicados com jwt de colaborador`() {
        mockMvc.perform(
            get("/api/ambientes/nao-publicados")
                .with(jwtComRoles("ROLE_COLABORADOR"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isForbidden)
    }

    @Test
    fun `deve negar acesso aos ambientes nao publicados por tipo com jwt de colaborador`() {
        mockMvc.perform(
            get("/api/ambientes/nao-publicados/tipo")
                .param("tipo", "SALA_AULA")
                .param("page", "0")
                .param("size", "20")
                .with(jwtComRoles("ROLE_COLABORADOR"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isForbidden)
    }

    @Test
    fun `deve negar acesso aos ambientes nao publicados por nome com jwt de colaborador`() {
        mockMvc.perform(
            get("/api/ambientes/nao-publicados/nome")
                .param("nome", "Sala")
                .param("page", "0")
                .param("size", "20")
                .with(jwtComRoles("ROLE_COLABORADOR"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isForbidden)
    }

    @Test
    fun `deve negar acesso aos ambientes nao publicados por localizacao com jwt de colaborador`() {
        mockMvc.perform(
            get("/api/ambientes/nao-publicados/localizacao")
                .param("campusId", "1")
                .param("unidadeId", "1")
                .param("blocoId", "1")
                .param("andar", "1")
                .param("page", "0")
                .param("size", "20")
                .with(jwtComRoles("ROLE_COLABORADOR"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isForbidden)
    }

    @Test
    fun `deve permitir acesso aos ambientes nao publicados com jwt de gestor`() {
        mockMvc.perform(
            get("/api/ambientes/nao-publicados")
                .with(jwtComRoles("ROLE_GESTOR_SISTEMA"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isOk)
    }

    @Test
    fun `deve permitir acesso aos ambientes nao publicados por tipo com jwt de gestor`() {
        mockMvc.perform(
            get("/api/ambientes/nao-publicados/tipo")
                .param("tipo", "SALA_AULA")
                .param("page", "0")
                .param("size", "20")
                .with(jwtComRoles("ROLE_GESTOR_SISTEMA"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isOk)
    }

    @Test
    fun `deve permitir acesso aos ambientes nao publicados por nome com jwt de gestor`() {
        mockMvc.perform(
            get("/api/ambientes/nao-publicados/nome")
                .param("nome", "Sala")
                .param("page", "0")
                .param("size", "20")
                .with(jwtComRoles("ROLE_GESTOR_SISTEMA"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isOk)
    }

    @Test
    fun `deve permitir acesso aos ambientes nao publicados por localizacao com jwt de gestor`() {
        mockMvc.perform(
            get("/api/ambientes/nao-publicados/localizacao")
                .param("campusId", "1")
                .param("unidadeId", "1")
                .param("blocoId", "1")
                .param("andar", "1")
                .param("page", "0")
                .param("size", "20")
                .with(jwtComRoles("ROLE_GESTOR_SISTEMA"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isOk)
    }

    @Test
    fun `deve negar acesso aos ambientes em validacao com jwt de colaborador`() {
        mockMvc.perform(
            get("/api/ambientes/validacao")
                .with(jwtComRoles("ROLE_COLABORADOR"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isForbidden)
    }

    @Test
    fun `deve negar acesso aos ambientes em validacao por tipo com jwt de colaborador`() {
        mockMvc.perform(
            get("/api/ambientes/validacao/tipo")
                .param("tipo", "SALA_AULA")
                .param("page", "0")
                .param("size", "20")
                .with(jwtComRoles("ROLE_COLABORADOR"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isForbidden)
    }

    @Test
    fun `deve negar acesso aos ambientes em validacao por nome com jwt de colaborador`() {
        mockMvc.perform(
            get("/api/ambientes/validacao/nome")
                .param("nome", "Sala")
                .param("page", "0")
                .param("size", "20")
                .with(jwtComRoles("ROLE_COLABORADOR"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isForbidden)
    }

    @Test
    fun `deve negar acesso aos ambientes em validacao por localizacao com jwt de colaborador`() {
        mockMvc.perform(
            get("/api/ambientes/validacao/localizacao")
                .param("campusId", "1")
                .param("unidadeId", "1")
                .param("blocoId", "1")
                .param("andar", "1")
                .param("page", "0")
                .param("size", "20")
                .with(jwtComRoles("ROLE_COLABORADOR"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isForbidden)
    }

    @Test
    fun `deve permitir acesso aos ambientes em validacao com jwt de validador`() {
        mockMvc.perform(
            get("/api/ambientes/validacao")
                .with(jwtComRoles("ROLE_VALIDADOR"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isOk)
    }

    @Test
    fun `deve permitir acesso aos ambientes em validacao por tipo com jwt de validador`() {
        mockMvc.perform(
            get("/api/ambientes/validacao/tipo")
                .param("tipo", "SALA_AULA")
                .param("page", "0")
                .param("size", "20")
                .with(jwtComRoles("ROLE_VALIDADOR"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isOk)
    }

    @Test
    fun `deve permitir acesso aos ambientes em validacao por nome com jwt de validador`() {
        mockMvc.perform(
            get("/api/ambientes/validacao/nome")
                .param("nome", "Sala")
                .param("page", "0")
                .param("size", "20")
                .with(jwtComRoles("ROLE_VALIDADOR"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isOk)
    }

    @Test
    fun `deve permitir acesso aos ambientes em validacao por localizacao com jwt de validador`() {
        mockMvc.perform(
            get("/api/ambientes/validacao/localizacao")
                .param("campusId", "1")
                .param("unidadeId", "1")
                .param("blocoId", "1")
                .param("andar", "1")
                .param("page", "0")
                .param("size", "20")
                .with(jwtComRoles("ROLE_VALIDADOR"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isOk)
    }

    private fun jwtComRoles(vararg roles: String) = jwt()
        .jwt { jwt ->
            jwt.claim("roles", roles.toList())
            jwt.subject("teste")
        }
        .authorities(*roles.map { SimpleGrantedAuthority(it) }.toTypedArray())
}

