<template>
  <q-page class="q-pa-sm">
    <div class="row justify-center q-gutter-sm">
      <div class="col-lg-2 col-md-2 col-sm-2 col-xs-12">
        <q-input v-model="mesano" label="Digite a competência. Exemplo: 05/2018" dense class="q-pb-xs" mask="##/####"/>
      </div>
      <div class="col-lg-2 col-md-2 col-sm-2 col-xs-12">
        <q-select v-model="crc" :options="crcopt" label="Selecionar CRC" dense/>
      </div>
      <div class="col-lg-2 col-md-2 col-sm-2 col-xs-12">
        <q-btn color="blue-grey-3" text-color="black" dense label="Consultar"  @click="consultaClientes()" :disabled="!mesano" icon="search"/>
      </div>
    </div>
      <div v-if="dados.length >= 0">
        <q-table :data="dados" :columns="columns" row-key="nome" dense no-results-label="Nenhum resultado encontrado." :pagination.sync="pagination" :filter="filter || status">
          <template v-slot:top>
            <q-input class="q-pa-md" v-model="filter" label="Pesquisar Cliente" style="width: 400px" clearable dense>
              <q-tooltip>Pesquisar Cliente</q-tooltip>
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-space />
            <q-select class="q-pa-md" :options="statusopt"  v-model="status" label="Status do Envio" style="width: 250px" clearable dense/>
            <q-toggle v-model="semEnvio" val="1" label="Cliente sem envio" @input="selecionaSemEnvio()"/>
          </template>
          <template v-slot:body-cell-nome="props">
            <q-td :props="props">
                <span class="cursor-pointer" @click="abreTce(props.row)"> {{props.row.nome.toUpperCase()}} </span>
            </q-td>
          </template>
          <template v-slot:body-cell-dtenviocp="props">
            <q-td :props="props">
                {{props.row.dtenviocp}}
            </q-td>
          </template>
          <template v-slot:body-cell-dtenviogp="props">
            <q-td :props="props">
                {{props.row.dtenviogp}}
            </q-td>
          </template>
        </q-table>
      </div>
  </q-page>
</template>

<script>
import { Loading, openURL, QSpinnerRadio } from 'quasar'
export default {
  name: 'PageIndex',
  data () {
    return {
      filter: '',
      status: '',
      crc: 'Passo Fundo',
      semEnvio: false,
      nome: '',
      dados: [],
      statusopt: ['Sem Pendências', 'Pendente de assinatura'],
      crcopt: ['PASSO FUNDO', 'PELOTAS', 'PORTO ALEGRE', 'SANTA MARIA', 'SANTA ROSA'],
      dadosSemEnvio: [],
      dadosBackup: [],
      mesano: '04/2022',
      anoscomp: ['01/2022', '02/2022', '03/2022', '04/2022', '05/2022', '06/2022', '07/2022', '08/2022', '09/2022', '10/2022', '11/2022', '12/2022'],
      pagination: {
        page: 1,
        rowsPerPage: 20,
        sortBy: 'nome',
        descending: false
        // rowsNumber: xx if getting data from a server
      },
      columns: [
        {
          name: 'nome',
          required: true,
          label: 'Nome do cliente',
          field: (row) => row.nome.toUpperCase(),
          format: (val) => `${val}`,
          align: 'left',
          sortable: true
        },
        {
          name: 'dtenviogp',
          align: 'left',
          label: 'Folha de Pagamento',
          field: (row) => row.dtenviogp,
          format: (val) => `${val}`
        },
        {
          name: 'dtenviocp',
          align: 'left',
          label: 'Contabilidade',
          field: (row) => row.dtenviocp,
          format: (val) => `${val}`
        }
      ]
    }
  },
  methods: {
    async selecionaSemEnvio () {
      if (this.semEnvio === true) {
        this.dadosSemEnvio = []
        this.dadosBackup = this.dados
        for (let index = 0; index < this.dados.length; index++) {
          if (this.dados[index].dtenviocp === undefined || this.dados[index].dtenviogp === undefined) {
            this.dadosSemEnvio.push(this.dados[index])
          }
        }
        this.dados = this.dadosSemEnvio
      } else {
        this.dados = this.dadosBackup
      }
    },
    async consultaClientes () {
      Loading.show({
        spinner: QSpinnerRadio,
        spinnerColor: 'teal-14',
        html: true,
        message: 'Conectando-se com o site do TCE.<br>Por favor Aguarde...'
      })
      // eslint-disable-next-line no-var
      var dados = {}
      dados.mes = this.mesano
      dados.crc = this.crc
      this.$axios
        .post('https://app-agenda-ihc.herokuapp.com/consultaClientes', dados)
        .then((response) => {
          this.dados = response.data.splice(1)
          Loading.hide()
        })
    },
    async abreTce (dados) {
      openURL(
        'http://portal.tce.rs.gov.br/pcdi2/relatorios-recibos-envio.action?&cdOrgao=' +
          dados.codigo +
          '&ano=' +
          this.mesano.substring(3, 7)
      )
    }
  }
}

</script>
<style lang="sass" scoped>
.row > div
  padding: 10px 15px
.row + .row
  margin-top: 1rem
</style>
