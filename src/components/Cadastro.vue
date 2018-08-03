<template>
  <div id="app-content-wrapper">
    <h2>Fique por dentro e contribua com os projetos para a cidade!</h2>
    <br />
    <!-- TODO: Trocar por url relativa -->
    <form id="formCadastro" accept-charset="utf-8" @submit="signup" action="/wp-content/plugins/cadastro-participe/cadastro-participe.php" method="POST">
      <span>Nome*</span><br />
      <input  v-model="nome"
              name="nome" 
              v-on:click="errName = false" 
              placeholder="Nome" 
              :class="{ 'input-error': errName }"
              required 
              autofocus>
      <br />
      <span>Organização</span><br />
      <input  v-model="organizacao"
              name="organizacao" 
              placeholder="Organização">
      <br />
      <span>E-mail*</span><br />
      <input  v-model="email"
              name="email" 
              v-on:click="errMail = false" 
              placeholder="E-mail"
              required 
              :class="{ 'input-error': errMail }">
      <br />
      <div class="container">
        {{ local.endereco }}
      </div><br />
      <div class="double-col">
        <button type="" v-on:click.stop.prevent="getGeoLocation()">
          <div class="icon-wrapper">
            <div class="pin icon"></div>
          </div>
          <span>Local</span>
        </button>
        <div>
          <input  v-model="cep"
                  name="cep"
                  @:click="errCep = false" 
                  v-on:blur="getAddress()"
                  placeholder="CEP" 
                  :class="{ 'input-error': errCep }" 
                  v-mask="'#####-###'" 
                  ref="cepInput">
          <button class="sqr-btn" v-on:click.stop.prevent="getAddress()">
            <div class="icon-wrapper">
              <div class="pin icon"></div>
            </div>
          </button>
        </div>
      </div>
      <br />
      <!-- Adicionar Regiões e Projetos de Interesse -->
      <div class="full-w-flex">
        <select v-model="regiaoSel">
          <option disabled value="">Regiões de Interesse</option>
          <option v-for="regiao in listaRegioesInt">{{ regiao.prefeitura }}</option>
        </select>
        <button class="sqr-btn" v-on:click.stop.prevent="addItem(regiaoSel, true)">
          <div class="icon-wrapper">
            <div class="plus icon"></div>
          </div>
        </button>
      </div>
      <br />
      <div class="full-w-flex">
        <select v-model="projetoSel">
          <option disabled value="">Projetos de Interesse</option>
          <option v-for="projeto in listaProjetosInt">{{ projeto }}</option>
        </select>
        <button class="sqr-btn" v-on:click.stop.prevent="addItem(projetoSel, false)">
          <div class="icon-wrapper">
            <div class="plus icon"></div>
          </div>
        </button>
      </div>
      <br />
      <div v-if="regioes[0] || projetos[0]">
        <span>Regiões e projetos selecionados</span>
        <br />
        <div class="removable-item" v-for="regiao in regioes" :key="'r'+regioes.indexOf(regiao)">
          <span>{{ regiao }}</span>
          <div class="icon-wrapper" v-on:click="removeItem(regioes.indexOf(regiao), true)">
            <div class="icon remove"></div>
          </div>
        </div>
        <div class="removable-item" v-for="projeto in projetos" :key="'p'+projetos.indexOf(projeto)">
          <span>{{ projeto }}</span>
          <div class="icon-wrapper" v-on:click="removeItem(projetos.indexOf(projeto), false)">
            <div class="icon remove"></div>
          </div>
        </div>
      </div>
      <input  v-model="regioes" 
              name="regioes" 
              v-show="false" />
      <input  v-model="projetos" 
              name="projetos" 
              v-show="false" />
      <br />
      <button id="btn-addall" class="removable-item" v-on:click.prevent="allRegions()" style="cursor: pointer">
        <div class="icon-wrapper">
          <div class="icon more-solid"></div>
        </div>
        <span>MONITORAR TODAS AS REGIÕES</span>
      </button>
      <button id="btn-clear" class="removable-item" v-on:click.prevent="allRegions(false)" style="cursor: pointer">
        <div class="icon-wrapper">
          <div class="icon remove"></div>
        </div>
        <span>LIMPAR REGIÕES SELECIONADAS</span>
      </button>
      <button id="btn-cadastrar" type="submit" ref="cadastroButton" style="cursor: pointer">CADASTRAR</button>
    </form>
  </div>
</template>

<script>
import {mask} from 'vue-the-mask';
import axios from 'axios';
export default {
  directives: {mask},
  name: 'Cadastro',
  data () {
    return {
      nome: '',
      organizacao: '',
      email: '',
      local: {
        lat: "",
        lon: "",
        endereco: ""
      },
      bairro: '',
      foundBairro: false,
      cep: '',
      errMail: false,
      errName: false,
      errCep: false,
      regiaoSel: '',
      projetoSel: '',
      regioes: [],
      projetos: [],
      listaRegioesInt: {    // Regiões de interesse: Prefeituras Regionais
        "Aricanduva/Vila Formosa": {
          prefeitura: "Aricanduva/Vila Formosa",
          bairros: ["Aricanduva","Carrão","Vila Formosa"]
        },
        "Butantã": {
          prefeitura: "Butantã",
          bairros: ["Butantã","Morumbi","Raposo Tavares","Rio Pequeno","Vila Sônia"]
        },
        "Campo Limpo": {
          prefeitura: "Campo Limpo",
          bairros: ["Campo Limpo","Capão Redondo","Vila Andrade"]
        },
        "Capela do Socorro": {
          prefeitura: "Capela do Socorro",
          bairros: ["Cidade Dutra","Grajaú","Socorro"]
        },
        "Casa Verde": {
          prefeitura: "Casa Verde",
          bairros: ["Cachoeirinha","Casa Verde","Limão"]
        },
        "Cidade Ademar": {
          prefeitura: "Cidade Ademar",
          bairros: ["Cidade Ademar","Pedreira"]
        },
        "Cidade Tiradentes": {
          prefeitura: "Cidade Tiradentes",
          bairros: ["Cidade Tiradentes"]
        },
        "Ermelino Matarazzo": {
          prefeitura: "Ermelino Matarazzo",
          bairros: ["Ermelino Matarazzo","Ponte Rasa"]
        },
        "Freguesia do Ó/Brasilândia": {
          prefeitura: "Freguesia do Ó/Brasilândia",
          bairros: ["Brasilândia","Freguesia do Ó"]
        },
        "Guaianases": {
          prefeitura: "Guaianases",
          bairros: ["Lajeado","Guaianazes"]
        },
        "Ipiranga": {
          prefeitura: "Ipiranga",
          bairros: ["Cursino","Ipiranga","Sacomã"]
        },
        "Itaim Paulista": {
          prefeitura: "Itaim Paulista",
          bairros: ["Itaim Paulista","Vila Curuçá"]
        },
        "Itaquera": {
          prefeitura: "Itaquera",
          bairros: ["Cidade Líder","Itaquera","José Bonifácio","Parque do Carmo"]
        },
        "Jabaquara": {
          prefeitura: "Jabaquara",
          bairros: ["Jabaquara"]
        },
        "Jaçanã/Tremembé": {
          prefeitura: "Jaçanã/Tremembé",
          bairros: ["Jaçanã","Tremembé"]
        },
        "Lapa": {
          prefeitura: "Lapa",
          bairros: ["Barra Funda","Jaguara","Jaguaré","Lapa","Perdizes","Vila Leopoldina"]
        },
        "M´Boi Mirim": {
          prefeitura: "M´Boi Mirim",
          bairros: ["Jardim Ângela","Jardim São Luís"]
        },
        "Mooca": {
          prefeitura: "Mooca",
          bairros: ["Água Rasa","Belém","Brás","Mooca","Pari","Tatuapé"]
        },
        "Parelheiros": {
          prefeitura: "Parelheiros",
          bairros: ["Marsilac","Parelheiros"]
        },
        "Penha": {
          prefeitura: "Penha",
          bairros: ["Artur Alvim","Cangaíba","Penha","Vila Matilde"]
        },
        "Perus": {
          prefeitura: "Perus",
          bairros: ["Anhanguera","Perus"]
        },
        "Pinheiros": {
          prefeitura: "Pinheiros",
          bairros: ["Alto de Pinheiros","Itaim Bibi","Jardim Paulista","Pinheiros"]
        },
        "Pirituba/Jaraguá": {
          prefeitura: "Pirituba/Jaraguá",
          bairros: ["Jaraguá","Pirituba","São Domingos"]
        },
        "Santana/Tucuruvi": {
          prefeitura: "Santana/Tucuruvi",
          bairros: ["Mandaqui","Santana","Tucuruvi"]
        },
        "Santo Amaro": {
          prefeitura: "Santo Amaro",
          bairros: ["Campo Belo","Campo Grande","Santo Amaro"]
        },
        "São Mateus": {
          prefeitura: "São Mateus",
          bairros: ["Iguatemi","São Rafael","São Mateus"]
        },
        "São Miguel Paulista": {
          prefeitura: "São Miguel Paulista",
          bairros: ["São Miguel","Jardim Helena","Vila Jacuí"]
        },
        "Sapopemba": {
          prefeitura: "Sapopemba",
          bairros: ["Sapopemba"]
        },
        "Sé": {
          prefeitura: "Sé",
          bairros: ["Bela Vista","Bom Retiro","Cambuci", "Centro","Consolação","Liberdade","República","Santa Cecília","Sé"]
        },
        "Vila Maria/Vila Guilherme": {
          prefeitura: "Vila Maria/Vila Guilherme",
          bairros: ["Vila Guilherme","Vila Maria","Vila Medeiros"]
        },
        "Vila Mariana": {
          prefeitura: "Vila Mariana",
          bairros: ["Moema","Saúde","Vila Mariana"]
        },
        "Vila Prudente": {
          prefeitura: "Vila Prudente",
          bairros: ["São Lucas","Vila Prudente"]
        }
      },
      listaProjetosInt: [    // Projetos de Interesse
        "Legislação urbanística",
        "Zona rural: Ligue os pontos",
        "Conselhos e órgãos colegiados",
        "OUC Água Branca",
        "OUC Água Espraiada",
        "OUC Centro",
        "OUC Bairros do Tamanduateí",
        "OUC Faria Lima",
        "PIU Arco Jurubatuba",
        "PIU Anhembi",
        "PIU Nações Unidas",
        "PIU Setor Central ",
        "PIU Terminais",
        "PIU Vila Leopoldina",
        "PIU Vila Olímpia",
        "PIU Pacaembu",
        "PIU NESP"
      ]
    }
  },
  methods: {
    getGeoLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.showPosition);        
      } else { 
        window.alert("Seu navegador não permite esse recurso. Por favor, digite seu CEP.");
      }
    },
    getAddress(){
      if(/^[0-9]{5}-[0-9]{3}$/.test(this.cep)){
        axios.get("https://viacep.com.br/ws/"+this.cep+"/json/").then(response => {
          this.local.endereco = this.formatAddressFromViacep(response.data);
          this.bairro = response.data.bairro;
          this.getFromCep();
        })
        .catch(error => {
          console.log(error);
        });
        this.errCep = false;
      }
      else {
        // window.alert("Por favor, verifique o CEP informado");
        this.errCep = true;
      }
    },
    getFromCep(){      
      // Percorre lista para encontrar prefeitura regional correspondente ao endereco informado
      this.foundBairro = false;
      for (var regional in this.listaRegioesInt){
        for (var bairro in this.listaRegioesInt[regional].bairros){          
            if(this.listaRegioesInt[regional].bairros[bairro] === this.bairro){
              this.foundBairro = true;
              this.addItem(this.listaRegioesInt[regional].prefeitura, true);
              break;
            }
        }
        if (this.foundBairro) { break; }
      }      
    },
    formatAddressFromViacep(rawData){
      let formatted = rawData.bairro+", "+rawData.localidade+" - "+rawData.uf;      
      return formatted;
    },
    filterReverseGeoData(results) {
      if(results && results.length) {
        for (var i=0; i<results.length; i++) {
          if (results[i].types.indexOf('postal_code') != -1) {
            this.cep = results[i].address_components[0].long_name;
            return results[i].formatted_address;
          }
        }
        return results[0].formatted_address;
      }
      return '';
    },
    showPosition(position) {
      this.local.lat = position.coords.latitude;
      this.local.lon = position.coords.longitude;

      // Requisitar AJAX de: 
      // let cepRequest = "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat="+position.coords.latitude+"&lon="+position.coords.latitude;
      let cepRequest = "http://maps.googleapis.com/maps/api/geocode/json?latlng="+position.coords.latitude+","+position.coords.longitude+"&sensor=true";
      axios.get(cepRequest).then(response => {
        this.local.endereco = this.filterReverseGeoData(response.data.results);
        this.getAddress();
      })
      .catch(error => {
        console.log(error);
      });
    },
    addItem(selItem, isRegion) {
      let regOrProj = isRegion ? "a região" : " projeto";
      if(selItem === "") {
        alert("Selecione um"+regOrProj+" para adicionar.")
      }
      else {
        let exists = false;
        if(isRegion){
          this.regioes.forEach(function(item, index){
            if (item === selItem)
              exists = true;
          });
          if(!exists)
            this.regioes.push(selItem);
        }
        else {
          this.projetos.forEach(function(item, index){
            if (item === selItem)
              exists = true;
          });
          if(!exists)
            this.projetos.push(selItem);
        }
      }
      selItem = "";
    },
    allRegions(addAll = true){
      let app = this;
      for (var prefeitura in this.listaRegioesInt) {
        addAll ? this.addItem(prefeitura, true) : this.removeItem(prefeitura, true);        
      }
      setTimeout(function(){ 
        app.$refs.cadastroButton.focus();
        app.$refs.cadastroButton.scrollIntoView();
       }, 200);
    },
    removeItem(selItem, isRegion) {
      if(isRegion){
        for (var i = this.listaRegioesInt.length - 1; i >= 0; i--) {
          console.log(this.listaRegioesInt[i]);
        }
      }
      isRegion ? this.regioes.splice(selItem, 1) : this.projetos.splice(selItem, 1);
    },
    validMail(email) {
        let ret = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return ret.test(String(email).toLowerCase());
    },
    signup:function(e){
      // let registro = {
      //   "nome": this.nome,
      //   "organizacao": this.organizacao,
      //   "email": this.email,
      //   "cep": this.cep,
      //   "regioes": this.regioes,
      //   "projetos": this.projetos
      // };

      // Verificar e-mail
      this.errMail = !this.validMail(this.email);
      // Verificar nome
      this.errName = !this.nome;
      // Verificar CEP
      this.errCep = !this.cep;
      if (!this.errCep && !this.errName && !this.errMail) {
        window.alert("Obrigado por sua participação!");
        return true;
      }      
      window.alert("Por favor, preencha os dados corretamente para efetuar seu cadastro.");      
      e.preventDefault();
    }
  }
}
</script>

<style scoped lang="scss">
  @import '../assets/cadastro-style.scss';
</style>
