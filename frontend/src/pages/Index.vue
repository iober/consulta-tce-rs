<template>
  <div class="q-pa-sm">
    <div class="row justify-center q-gutter-sm">
      <div class="col-lg- col-md-2 col-sm-2 col-xs-12">
        <q-input v-model="mesano" label="Digite a competência. Exemplo: 05/2018" dense class="q-pb-xs" mask="##/####"/>
      </div>
      <div class="col-lg-2 col-md-2 col-sm-4 col-xs-12">
        <q-select v-model="crc" :options="crcopt" label="Selecionar CRC" dense/>
      </div>
      <div class="col-lg-4 col-md-5 col-sm-5 col-xs-12">
        <q-btn color="blue-grey-3" text-color="black" dense label="Consultar"  @click="consultaClientes()" :disabled="!mesano" icon="search"/>
        <q-btn color="white" text-color="black" class="q-ml-sm" label="GERENCIAR CLIENTES" dense icon="manage_accounts" @click="clientedlg = true"/>
      </div>
    </div>
      <div>
        <q-table :data="dados" :columns="columns" row-key="nome" dense no-results-label="Nenhum resultado encontrado." :pagination.sync="pagination" :filter="filter || status">
          <template v-slot:top>
            <q-input class="q-pa-md" v-model="filter" label="Pesquisar Cliente" style="width: 400px" clearable dense>
              <q-tooltip>Pesquisar Cliente</q-tooltip>
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-space />
              <div class="row">
                <q-item-section class="col-4">
                  <q-item-label>
                    <strong class="text-weight-medium">FOLHA</strong>
                  </q-item-label>
                  <q-item-label caption class="flex flex-center">
                      <span style="font-size: 20px"><strong>{{totalgp}}</strong></span>
                  </q-item-label>
                </q-item-section>
                <q-space />
                <q-item-section class="col-6">
                  <q-item-label>
                    <strong class="text-weight-medium">CONTABILIDADE</strong>
                  </q-item-label>
                  <q-item-label caption class="flex flex-center">
                      <span style="font-size: 20px"><strong>{{totalcp}}</strong></span>
                  </q-item-label>
                </q-item-section>
              </div>
            <q-space />
            <q-select class="q-pa-md" :options="statusopt"  v-model="status" label="Status do Envio" style="width: 250px" clearable dense/>
            <q-toggle v-model="semEnvio" val="1" label="Cliente sem envio" @input="selecionaSemEnvio()"/>
          </template>
          <template v-slot:body="props">
            <q-tr>
              <q-td :style="!props.row.dtenviocp || !props.row.dtenviogp ? 'color: red' : ''">
                <span class="cursor-pointer" @click="abreTce(props.row)"> {{props.row.nome.toUpperCase()}} </span>
              </q-td>
              <q-td>
                <div v-html="props.row.dtenviogp"></div>
              </q-td>
              <q-td>
                <div v-html="props.row.dtenviocp"></div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
      <q-dialog v-model="clientedlg" :maximized="mobile">
        <q-card :style="this.$q.platform.is.mobile ? '' : 'width: 700px; max-width: 80vw;'">
          <q-card-section>
            <div class="text-h6">Cadastro de Clientes</div>
          </q-card-section>
          <q-card-section>
            <clientes />
          </q-card-section>
          <q-card-actions align="right">
          <q-btn flat label="Fechar" color="primary" v-close-popup outline/>
          </q-card-actions>
        </q-card>
      </q-dialog>
  </div>
</template>

<script>
import { openURL, QSpinnerRadio } from 'quasar'
import clientes from '../components/clientes.vue'
const moment = require('moment')
moment.locale('pt-br')
export default {
  components: { clientes },
  name: 'index',
  data () {
    return {
      filter: '',
      mobile: false,
      clientedlg: false,
      status: '',
      crc: 'Passo Fundo',
      semEnvio: false,
      linhaSelecionada: '',
      nome: '',
      dados: [],
      statusopt: ['Sem Pendências', 'Pendente de assinatura'],
      crcopt: ['PASSO FUNDO', 'PELOTAS', 'PORTO ALEGRE', 'SANTA MARIA', 'SANTA ROSA'],
      dadosSemEnvio: [],
      dadosBackup: [],
      mesano: '04/2022',
      totalgp: 0,
      totalcp: 0,
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
  created () {
    if (this.$q.platform.is.mobile) {
      this.mobile = true
    }
    this.$q.loading.show({
      spinnerColor: 'teal-14',
      html: true,
      delay: 5000,
      message: 'Por favor Aguarde...'
    })
    this.mesano = moment().subtract(1, 'months').format('MM/YYYY')
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
      this.dadosSemEnvio = []
      this.dadosBackup = []
      this.totalgp = 0
      this.totalcp = 0
      this.semEnvio = false
      this.status = ''
      this.filter = ''
      this.$q.loading.show({
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
        .post('http://localhost:3000/consultaClientes', dados)
        .then((response) => {
          this.dados = response.data.splice(1)
          this.dados.forEach((element, index) => {
            if (element.dtenviogp) {
              if (element.dtenviogp.indexOf('assinatura') > 0) {
                this.dados[index].dtenviogp = '<span style="color: red; font-weight: bold">' + this.dados[index].dtenviogp + '</span>'
              }
              this.totalgp++
            }
            if (element.dtenviocp) {
              if (element.dtenviocp.indexOf('assinatura') > 0) {
                this.dados[index].dtenviocp = '<span style="color: red; font-weight: bold">' + this.dados[index].dtenviocp + '</span>'
              }
              this.totalcp++
            }
          })
          this.totalgp = this.dados.length - this.totalgp
          this.totalcp = this.dados.length - this.totalcp
          this.$q.loading.hide()
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
