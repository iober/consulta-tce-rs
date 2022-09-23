<template>
  <q-form>
    <div class="row q-gutter-xs">
      <div class="col-12">
        <q-input v-model="dados.nmCliente" type="text" label="Nome do Cliente" dense class="full-width"/>
        <q-select v-model="dados.crc" :options="optcrc" label="CRC" dense class="full-width"/>
        <q-input v-model="dados.codTce" label="Código TCE" dense class="full-width" mask="######"/>
      </div>
      <div class="col-12" align="right">
        <q-btn v-if="dados.idCliente" size="sm" flat label="Cancelar" icon="clear" color="primary" @click="limpaCampos()" />
        <q-btn v-if="!dados.idCliente" :disabled="!dados.nmCliente || !dados.crc || !dados.codTce" size="sm" label="Adicionar" icon="save" color="primary" @click="incluirCliente()" />
        <q-btn v-else size="sm" label="Alterar" icon="save" color="primary" :disable="dados == '' || !dados" @click="editarCliente()" />
      </div>
      <div class="col-12">
      <q-table
        dense
        flat
        :data="clientes"
        :columns="columns"
        row-key="idCliente"
        :filter="filterClientes"
        :pagination="paginationClientes"
        style="font-size: 10px"
      >
      <template v-slot:top>
          <q-input dense color="primary" v-model="filterClientes" placeholder="Pesquisar" class="full-width">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        <template v-slot:body="props">
          <q-tr>
            <q-td>
              <div class="text-left">
                {{props.row.nmCliente.toUpperCase()}}
              </div>
            </q-td>
            <q-td>
              <div class="text-left">
                {{props.row.crc.toUpperCase()}}
              </div>
            </q-td>
            <q-td>
              <div class="text-left">
                {{props.row.codTce}}
              </div>
            </q-td>
            <q-td align="right">
              <q-btn flat round size="xs" color="primary" icon="edit" @click="editarDadosCliente(props.row)">
                <q-tooltip>
                  Editar cliente.
                </q-tooltip>
              </q-btn>
              <q-btn flat round size="xs" color="red-5" icon="delete" @click="removerCliente(props.row)">
                <q-tooltip>
                  Excluir cliente.
                </q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
      </div>
    </div>
  </q-form>
</template>

<script>
export default {
  // name: 'ComponentName',
  data () {
    return {
      idCliente: '',
      optcrc: [{ label: 'Passo Fundo', value: 'Passo Fundo' }, { label: 'Pelotas', value: 'Pelotas' }, { label: 'Porto Alegre', value: 'Porto Alegre' }, { label: 'Santa Maria', value: 'Santa Maria' }, { label: 'Santa Rosa', value: 'Santa Rosa' }],
      dados: {
        idCliente: '',
        nmCliente: '',
        codTce: '',
        crc: ''
      },
      clientes: [],
      filterClientes: '',
      linhaSelecionada: '',
      paginationClientes: {
        page: 1,
        rowsPerPage: 10
      },
      columns: [
        {
          name: 'nmCliente',
          required: true,
          label: 'Nome',
          align: 'left',
          field: (row) => row.nmCliente.toUpperCase(),
          format: (val) => `${val}`,
          sortable: true,
          headerClasses: 'bg-grey-5 text-grey-10'
        },
        {
          name: 'crc',
          required: true,
          field: (row) => row.crc.toUpperCase(),
          format: (val) => `${val}`,
          label: 'CRC',
          align: 'left',
          sortable: true,
          headerClasses: 'bg-grey-5 text-grey-10'
        },
        {
          name: 'codTce',
          required: true,
          field: (row) => row.codTce.toLowerCase(),
          format: (val) => `${val}`,
          label: 'Código TCE',
          align: 'left',
          sortable: true,
          headerClasses: 'bg-grey-5 text-grey-10'
        },
        {
          name: 'acoes',
          headerClasses: 'bg-grey-5 text-grey-10'
        }
      ]
    }
  },
  created () {
    this.carregaClientes()
  },
  methods: {
    async carregaClientes () {
      await this.$axios.get('https://consulta-tce-api.iober.com.br/clientesPadGeral/')
        .then((response) => {
          this.clientes = response.data
        }).catch(() => {
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: 'Erro ao carregar clientes.',
            icon: 'report_problem'
          })
        })
    },
    async incluirCliente () {
      var dados = {}
      dados.nmCliente = this.dados.nmCliente
      dados.crc = this.dados.crc.value
      dados.codTce = this.dados.codTce
      await this.$axios.post('https://consulta-tce-api.iober.com.br/adiciona', dados)
        .then((response) => {
          this.carregaClientes()
          this.notificaoSucesso('Cliente cadastrado.')
          this.limpaCampos()
        }).catch(() => {
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: 'Erro ao adicionar cliente.',
            icon: 'report_problem'
          })
        })
    },
    // guarda dados na memoria para atualizar
    async editarDadosCliente (cli) {
      this.dados.idCliente = cli.idCliente
      this.dados.nmCliente = cli.nmCliente
      this.dados.crc = cli.crc
      this.dados.codTce = cli.codTce
    },
    async editarCliente () {
      const dados = {}
      dados.idCliente = this.dados.idCliente
      dados.nmCliente = this.dados.nmCliente
      dados.crc = this.dados.crc
      dados.codTce = this.dados.codTce
      await this.$axios.post('https://consulta-tce-api.iober.com.br/atualiza', dados)
        .then(response => {
          this.carregaClientes()
          this.notificaoSucesso('Cliente atualizado.')
          this.limpaCampos()
        }).catch((err) => {
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: 'Falha ao atualizar cliente! ' + err,
            icon: 'report_problem'
          })
        })
    },
    async removerCliente (cli) {
      this.$q
        .dialog({
          title: '<i class="far fa-trash-alt" style="color: #d95453"></i> <span style="color: #d95453">Excluir Cliente!</span>',
          message: '<b>Cliente:</b> ' + cli.nmCliente + '<br><span style="color: #6d6d6d">Ao remover este cliente, não é mais possível recupera-lo. </span>',
          persistent: true,
          html: true,
          ok: {
            size: 'sm',
            color: 'red-5',
            label: 'Excluir'
          },
          cancel: {
            size: 'sm',
            color: 'black',
            outline: true,
            label: 'cancelar'
          }
        })
        .onOk(async () => {
          const dados = {}
          dados.idCliente = cli.idCliente
          await this.$axios
            .post('https://consulta-tce-api.iober.com.br/remove', dados)
            .then(response => {
              this.$q.notify({
                color: 'red-5',
                position: 'bottom',
                message: 'Cliente removido.',
                icon: 'delete_forever'
              })
              this.clientes = this.clientes.filter(val => val.idCliente !== cli.idCliente)
            }).catch((err) => {
              this.$q.notify({
                color: 'negative',
                position: 'top',
                message: 'Falha ao excluir cliente' + err,
                icon: 'report_problem'
              })
            })
        })
        .onCancel(() => {})
    },
    notificaoSucesso (msg) {
      this.$q.notify({
        color: 'green-8',
        position: 'bottom',
        message: msg,
        icon: 'done'
      })
    },
    limpaCampos () {
      this.dados = {}
    }
  }
}
</script>
