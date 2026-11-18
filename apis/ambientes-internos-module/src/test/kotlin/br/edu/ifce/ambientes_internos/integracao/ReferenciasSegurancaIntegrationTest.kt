package br.edu.ifce.ambientes_internos.integracao

import br.edu.ifce.ambientes_internos.TestApplication
import br.edu.ifce.ambientes_internos.TestSecurityConfig
import br.edu.ifce.ambientes_internos.model.repository.BlocoRepository
import br.edu.ifce.ambientes_internos.model.repository.CampusRepository
import br.edu.ifce.ambientes_internos.model.repository.UnidadeRepository
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.context.annotation.Import
import org.springframework.http.HttpHeaders
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

/**
 * As refs administrativas validam a existência do pai: ids inexistentes retornam `400`,
 * diferente da projeção publicada (`/publicados/unidades|blocos`), que retorna `200 []`.
 * Por isso os casos usam os ids reais criados no preparo.
 */
@SpringBootTest(classes = [TestApplication::class])
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestSecurityConfig::class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("Testes de integração de segurança das referências administrativas de localização")
class ReferenciasSegurancaIntegrationTest {

    @Autowired
    lateinit var mockMvc: MockMvc

    @Autowired
    lateinit var repoCampus: CampusRepository

    @Autowired
    lateinit var repoUnidade: UnidadeRepository

    @Autowired
    lateinit var repoBloco: BlocoRepository

    private var campusId: Long = 0
    private var unidadeId: Long = 0

    @BeforeAll
    fun prepararDados() {
        val unidade = criarUnidade(repoCampus, repoUnidade)
        campusId = unidade.campus.id!!
        unidadeId = unidade.id!!
        criarBloco(repoBloco, unidade, "BLOCO SEG ${UUID.randomUUID().toString().take(8).uppercase()}")
    }

    // ================= /api/campus =================

    @Test
    fun `deve negar campus para anonimo`() {
        mockMvc.perform(get("/api/campus").header(HttpHeaders.ACCEPT, "application/json"))
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `deve negar campus para colaborador`() {
        mockMvc.perform(
            get("/api/campus")
                .with(jwtComRoles("ROLE_COLABORADOR"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isForbidden)
    }

    @Test
    fun `deve permitir campus para gestor`() {
        mockMvc.perform(
            get("/api/campus")
                .with(jwtComRoles("ROLE_GESTOR_SISTEMA"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isOk)
    }

    @Test
    fun `deve permitir campus para validador`() {
        mockMvc.perform(
            get("/api/campus")
                .with(jwtComRoles("ROLE_VALIDADOR"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isOk)
    }

    // ================= /api/unidades =================

    @Test
    fun `deve negar unidades para anonimo`() {
        mockMvc.perform(
            get("/api/unidades").param("campusId", campusId.toString())
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isUnauthorized)
    }

    @Test
    fun `deve negar unidades para colaborador`() {
        mockMvc.perform(
            get("/api/unidades").param("campusId", campusId.toString())
                .with(jwtComRoles("ROLE_COLABORADOR"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isForbidden)
    }

    @Test
    fun `deve permitir unidades para gestor`() {
        mockMvc.perform(
            get("/api/unidades").param("campusId", campusId.toString())
                .with(jwtComRoles("ROLE_GESTOR_SISTEMA"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isOk)
    }

    @Test
    fun `deve permitir unidades para validador`() {
        mockMvc.perform(
            get("/api/unidades").param("campusId", campusId.toString())
                .with(jwtComRoles("ROLE_VALIDADOR"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isOk)
    }

    // ================= /api/blocos =================

    @Test
    fun `deve negar blocos para anonimo`() {
        mockMvc.perform(
            get("/api/blocos").param("unidadeId", unidadeId.toString())
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isUnauthorized)
    }

    @Test
    fun `deve negar blocos para colaborador`() {
        mockMvc.perform(
            get("/api/blocos").param("unidadeId", unidadeId.toString())
                .with(jwtComRoles("ROLE_COLABORADOR"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isForbidden)
    }

    @Test
    fun `deve permitir blocos para gestor`() {
        mockMvc.perform(
            get("/api/blocos").param("unidadeId", unidadeId.toString())
                .with(jwtComRoles("ROLE_GESTOR_SISTEMA"))
                .header(HttpHeaders.ACCEPT, "application/json")
        ).andExpect(status().isOk)
    }

    @Test
    fun `deve permitir blocos para validador`() {
        mockMvc.perform(
            get("/api/blocos").param("unidadeId", unidadeId.toString())
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
