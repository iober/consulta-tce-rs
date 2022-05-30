const express = require("express"),
  app = express(),
  cors = require("cors"),
  cheerio = require("cheerio"),
  axios = require("axios"),
  mysql = require("mysql")
bodyParser = require("body-parser"), 
port = process.env.PORT || 3000
app.set("port", port);
app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

var con = mysql.createPool({
  connectionLimit: 25,
  user: 'dayanagiacomin',
  password: 'caralho4',
  host: 'mysql.dayanagiacomini.com.br',
  database: 'dayanagiacomin',
  port: 3306
});

app.get("/", (req, res ) => {
  console.log('*** OK OK OK ***')  
  res.write('*** API OK ***')
})

app.get("/start", (req, res ) => {
  var https = require('https')
    https.get('https://consulta-tce-rs.herokuapp.com/')
    res.send(200)
})

// retorna todos os resultados do sistema de controle do PAD
app.get('/clientesPad/:id', function(req, res) {
  var sql = 'select * from clientesPad where crc like "%' +  req.params.id +  '%"';
  con.query(sql, function(err, result) {
    if (err) {
      console.log(err.stack);
    }
    res.send(result);
  });
});

app.get('/clientesPadGeral', function(req, res) {
  var sql = 'select * from clientesPad';
  con.query(sql, function(err, result) {
    if (err) {
      console.log(err.stack);
    }
    res.send(result);
  });
});

app.post("/consultaClientes", (req, res) => {
  var anomes = {}
  var crc = req.body.crc
  anomes.completo = req.body.mes
  anomes.mes = req.body.mes.substring(0, 2)
  anomes.ano = req.body.mes.substring(3, 7)
  switch (anomes.mes) {
    case '01':
      anomes.mescp = '1º mês/' + anomes.ano
      break;
    case '02':
      anomes.mescp = '2º mês/' + anomes.ano
      break;
    case '03':
      anomes.mescp = '3º mês/' + anomes.ano
      break;
    case '04':
      anomes.mescp = '4º mês/' + anomes.ano
      break;
    case '05':
      anomes.mescp = '5º mês/' + anomes.ano
      break;
    case '06':
      anomes.mescp = '6º mês/' + anomes.ano
      break;
    case '07':
      anomes.mescp = '7º mês/' + anomes.ano
      break;
    case '08':
      anomes.mescp = '8º mês/' + anomes.ano
      break;
    case '09':
      anomes.mescp = '9º mês/' + anomes.ano
      break;
    case '10':
      anomes.mescp = '10º mês/' + anomes.ano
      break;
    case '11':
      anomes.mescp = '11º mês/' + anomes.ano
      break;    
    case '12':
      anomes.mescp = '12º mês/' + anomes.ano
      break;  
    default:
      break;
  }
    var clientes = [
        {
          nome: '',
          codigo: '',
          sistemacp: '',
          sistemagp: '',
          dtenviocp: '',
          dtenviogp: ''
        },
      ]; 
      var clientes2 = [
        {
          nome: '',
          codigo: '',
          sistemacp: '',
          sistemagp: '',
          dtenviocp: '',
          dtenviogp: ''
        },
      ];             
    axios
    .get('https://govbrpf.herokuapp.com/clientesPad/' + crc)
    .then(async (response) => {
          for (let index = 0; index < response.data.length; index++) {
            clientes[index] = {
                idcliente: response.data[index].idCliente,
                nome: response.data[index].nmCliente,
                codigo: response.data[index].codTce       
            }
            ler(clientes[index])
          }
          // setTimeout(() => {
          //   ler()
          // }, 1600);          
    })
    .catch((error) => {
        console.log("Erro carregar API", error);
    });    
  function ler(cli) {
    // for (let index = 0; index < clientes.length; index++) {
      let url =
        "https://portal.tce.rs.gov.br/pcdi2/relatorios-recibos-envio.action?&cdOrgao=" + cli.codigo + "&ano="+ anomes.ano + ""
      axios
        .get(url)
        .then((response) => {
          const $ = cheerio.load(response.data);
          if ($.length > 0) {
            var items = new Array();
            var items2 = new Array();
            $(".table tr td:nth-child(1)").each(function () {
              items.push($(this).html());
            });
            $(".table tr td:nth-child(4)").each(function () {
              items2.push($(this).html());
            });
            // $(".table tr").each(function () {
            //     items.push($(this).find("td:nth-child(1)").text());
            //   });            
            for (let index2 = 0; index2 <= items.length; index2++) {     
              if (items[index2] !== undefined) {
                  if (items[index2] === anomes.mescp) {
                    cli.sistemacp = 'Contabilidade'
                    cli.dtenviocp= items[index2] + ' - ' + items2[index2]
                  } 
                  if (items[index2].substring(3,10) === anomes.completo) {
                    cli.sistemagp= 'Folha de Pagamento'
                    cli.dtenviogp= items[index2] + ' - ' + items2[index2]                   
                  }
                  // clientes[index].sistemagp= 'Folha de Pagamento'
                  // clientes[index].dtenviogp= items[index2]  
              } 
            }
          }
          clientes2.push(cli)
          if (clientes2.length === clientes.length) {
            setTimeout(() => {
              res.send(clientes2)
            }, 2000);            
          }
        })
        .catch((error) => {
          console.log("erro", error);
        });
    // }
    // // function mostrar () {
    // //     console.log(clientes)
    // // }
    // setTimeout(() => {
    //     res.send(clientes2)    
    // }, 10000);
    
  }
});

// INICIO DO CRUD CLIENTES

// insere cadastro no banco
app.post('/adiciona', (req, res) => {
  var dados = req.body
  con.query('INSERT INTO clientesPad SET ?', dados, function(
    error,
    results,
    fields
  ) {
    if (error) throw error;
    res.end(JSON.stringify(results));
  });
});

// deleta cadastro
app.post('/remove', (req, res) => {
  var dados = req.body
  con.query(
    'delete from clientesPad where idCliente=?',
    [dados.idCliente],
    function(error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    }
  );
});

app.post('/atualiza', (req, res) => {
  var dados = req.body
  if (dados.crc.value !== undefined) {
    dados.crc = dados.crc.value    
  }
  var query = `update clientesPad set nmCliente=?, crc=?, codTce=? where idCliente=?`
  con.query(query, [dados.nmCliente, dados.crc, dados.codTce, dados.idCliente], (err, rows, fields) => {
      if (!err) {
         res.send(rows.rows)
      } else {
          console.log(err)
      }
  })
});

app.listen(port, () => {
  console.log("\nServidor rodando na porta: 3000");
});
