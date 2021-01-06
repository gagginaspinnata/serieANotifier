const axios = require("axios");
const cheerio = require("cheerio");

const calendario_url =
  "http://www.legaseriea.it/it/serie-a/calendario-e-risultati";

// get a source code of an html page
async function getSource(url, proxy = false) {
  const timOut = 4000;
  if (proxy != false) {
    console.log("checking with proxy");
    const response = await axios.get(url, {
      proxy: {
        host: proxy.host,
        port: proxy.port,
      },
      timeout: timeOut,
    });
    return response["data"];
  } else {
    try {
      const response = await axios.get(url, {
        timeout: timOut,
      });
      return response["data"];
    } catch (error) {
      throw new Error(`Impossibile ottere l html della pagina ${url}`);
    }
  }
}

async function getCurrentMatch() {
  // getting source coude of the html page
  const source = await getSource(calendario_url);
  let $ = cheerio.load(source);

  // Estraggo i dati relativi alla giornata IN CORSO
  let giornata = $(".risultati > h3").text().trim();
  let numero_giornata = giornata.split("-")[0].substring(0, 2);
  giornata = giornata.split("-")[1].trim();
  let date = new Date(`${giornata.split('/')[2]}-${giornata.split('/')[1]}-${giornata.split('/')[0]}`);
  giornata = {
    date,
    numero_giornata
  }
  return giornata;
}

// Prende in ingresso la pagina di una giornata di serie A e restituisce un array di questo tipo:
async function getDataOfMatches(url) {
  // getting source coude of the html page
  const source = await getSource(url);
  let $ = cheerio.load(source);


  let results = [];

  $('.box-partita').each(function (i, item) {

    // Ricerca data ed ora della partita
    let data_ora = $(this).find('.datipartita > p > span').text()
    let data = data_ora.split(' ')[0]
    let ora = data_ora.split(' ')[1]

    // Ricerca del provider televisivo
    let pattern = /Diretta:\s(.+)\s/gm
    let provider = pattern.exec($(this).find('.datipartita').text())[1].trim()

    // Ricerca delle due squadre
    pattern = /<h4 class="nomesquadra">(.+)<\/h4>/gm
    let squadre = $(this).html().match(pattern)
    let squadra_casa = squadre[0].split('>')[1].split('<')[0]
    let squadra_ospiti = squadre[1].split('>')[1].split('<')[0]

    let partite = {
      data,
      ora,
      provider,
      squadra_casa,
      squadra_ospiti
    }

    results.push(partite)
  })
  return results
}

// controlla che la data mostrata in homepage corrisponda alla data odierna
async function isThereIsAnyMatch(){
  let current_date  = new Date();

  let current_match = await getCurrentMatch()

  if(current_date.toLocaleDateString('it-IT')== current_match['date'].toLocaleDateString('it-IT')){
  return true
  }
  return false
  
}


(async () => {

  if(isThereIsAnyMatch()){
    console.log(await getCurrentMatch())
  }

})();
