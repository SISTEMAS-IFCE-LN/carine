package br.edu.ifce.ambientes_internos.integracao

import br.edu.ifce.ambientes_internos.TestApplication
import br.edu.ifce.ambientes_internos.TestSecurityConfig
import br.edu.ifce.ambientes_internos.model.domain.entity.ambientes.Bloco
import br.edu.ifce.ambientes_internos.model.domain.entity.ambientes.LaboratorioInformatica
import br.edu.ifce.ambientes_internos.model.domain.entity.ambientes.Localizacao
import br.edu.ifce.ambientes_internos.model.domain.entity.ambientes.SalaAula
import br.edu.ifce.ambientes_internos.model.domain.entity.ambientes.enums.StatusAmbiente
import br.edu.ifce.ambientes_internos.model.domain.entity.geometrias.Geometria
import br.edu.ifce.ambientes_internos.model.domain.entity.geometrias.Retangular
import br.edu.ifce.ambientes_internos.model.repository.AmbienteRepository
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
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.math.BigDecimal
import java.util.UUID

@SpringBootTest(classes = [TestApplication::class])
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestSecurityConfig::class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
// sem @WithMockUser de propósito: o resumo do bloco é público
@DisplayName("Testes de integração do resumo derivado do bloco publicado")
class CatalogoResumoBlocoIntegrationTest {

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

    private var blocoId: Long = 0
    private var blocoSemPublicadoId: Long = 0
    private lateinit var nomeBloco: String

    @BeforeAll
    fun prepararDados() {
        val sufixo = UUID.randomUUID().toString().take(8).uppercase()
        val unidade = criarUnidade(repoCampus, repoUnidade)
        val bloco = criarBloco(repoBloco, unidade, "BLOCO RESUMO $sufixo")
        val blocoVazio = criarBloco(repoBloco, unidade, "BLOCO VAZIO $sufixo")

        blocoId = bloco.id!!
        blocoSemPublicadoId = blocoVazio.id!!
        nomeBloco = bloco.nome

        val terreo = Localizacao(bloco = bloco, andar = 0)
        val primeiroAndar = Localizacao(bloco = bloco, andar = 1)
        val segundoAndar = Localizacao(bloco = bloco, andar = 2)
        val quintoAndar = Localizacao(bloco = bloco, andar = 5)

        criarSala(
            nome = "SALA RESUMO 1 $sufixo",
            localizacao = terreo,
            capacidade = 30,
            base = "5.0",
            altura = "10.0",
            status = StatusAmbiente.PUBLICADO,
        )
        criarLaboratorio(
            nome = "LAB RESUMO $sufixo",
            localizacao = primeiroAndar,
            capacidade = 40,
            base = "6.0",
            altura = "5.0",
            status = StatusAmbiente.PUBLICADO,
        )
        criarSala(
            nome = "SALA RESUMO 2 $sufixo",
            localizacao = segundoAndar,
            capacidade = 20,
            base = "4.0",
            altura = "5.0",
            repeticao = 2,
            status = StatusAmbiente.PUBLICADO,
        )
        criarSala(
            nome = "SALA NAO PUBLICA $sufixo",
            localizacao = quintoAndar,
            capacidade = 99,
            base = "10.0",
            altura = "10.0",
            status = StatusAmbiente.NAO_PUBLICADO,
        )
        criarSala(
            nome = "SALA BLOCO VAZIO $sufixo",
            localizacao = Localizacao(bloco = blocoVazio, andar = 0),
            capacidade = 10,
            base = "1.0",
            altura = "1.0",
            status = StatusAmbiente.NAO_PUBLICADO,
        )
    }

    private fun criarSala(
        nome: String,
        localizacao: Localizacao,
        capacidade: Int,
        base: String,
        altura: String,
        repeticao: Int = 1,
        status: StatusAmbiente,
    ): SalaAula {
        val sala = SalaAula(
            nome = nome,
            localizacao = localizacao,
            capacidade = capacidade,
            geometrias = geometrias(base, altura, repeticao),
            pesDireitos = mutableSetOf(BigDecimal("3.0")),
            esquadrias = mutableSetOf(),
        )
        sala.status = status
        return repoAmb.save(sala)
    }

    private fun criarLaboratorio(
        nome: String,
        localizacao: Localizacao,
        capacidade: Int,
        base: String,
        altura: String,
        repeticao: Int = 1,
        status: StatusAmbiente,
    ): LaboratorioInformatica {
        val laboratorio = LaboratorioInformatica(
            nome = nome,
            localizacao = localizacao,
            capacidade = capacidade,
            geometrias = geometrias(base, altura, repeticao),
            pesDireitos = mutableSetOf(BigDecimal("3.0")),
            esquadrias = mutableSetOf(),
        )
        laboratorio.status = status
        return repoAmb.save(laboratorio)
    }

    private fun geometrias(
        base: String,
        altura: String,
        repeticao: Int,
    ): MutableSet<Geometria> = mutableSetOf(
        Retangular(base = BigDecimal(base), altura = BigDecimal(altura), repeticao = repeticao) as Geometria
    )

    @Test
    fun `deve retornar o resumo derivado sem Authorization`() {
        mockMvc.perform(get("/api/ambientes/publicados/blocos/$blocoId/resumo"))
            .andExpect(status().isOk)
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(blocoId))
            .andExpect(jsonPath("$.nome").value(nomeBloco))
            .andExpect(jsonPath("$.areaTotal").value(120.0))
            .andExpect(jsonPath("$.pavimentos").value(3))
            .andExpect(jsonPath("$.capacidadeTotal").value(90))
            .andExpect(jsonPath("$.tipos.length()").value(2))
            .andExpect(jsonPath("$.tipos[0].tipo").value("Laboratório de Informática"))
            .andExpect(jsonPath("$.tipos[0].total").value(1))
            .andExpect(jsonPath("$.tipos[1].tipo").value("Sala de Aula"))
            .andExpect(jsonPath("$.tipos[1].total").value(2))
            .andExpect(jsonPath("$.andares.length()").value(3))
            .andExpect(jsonPath("$.andares[0].andar").value(0))
            .andExpect(jsonPath("$.andares[0].total").value(1))
            .andExpect(jsonPath("$.andares[1].andar").value(1))
            .andExpect(jsonPath("$.andares[1].total").value(1))
            .andExpect(jsonPath("$.andares[2].andar").value(2))
            .andExpect(jsonPath("$.andares[2].total").value(1))
            .andExpect(jsonPath("$.campus").doesNotExist())
            .andExpect(jsonPath("$.unidade").doesNotExist())
    }

    @Test
    fun `deve retornar 404 para bloco sem ambiente publicado`() {
        mockMvc.perform(get("/api/ambientes/publicados/blocos/$blocoSemPublicadoId/resumo"))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `deve retornar 404 para bloco inexistente`() {
        mockMvc.perform(get("/api/ambientes/publicados/blocos/${Long.MAX_VALUE}/resumo"))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `deve retornar 400 para blocoId invalido`() {
        mockMvc.perform(get("/api/ambientes/publicados/blocos/0/resumo"))
            .andExpect(status().isBadRequest)
    }
}
