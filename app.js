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

// Prende in ingresso la pagina di una giornata di serie A e restituisce un array di questo tipo:

// [
//   { date: 2021-06-01T00:00:00.000Z, numero_giornata: '16' },
//   {
//     data: '06/01/2021',
//     ora: '12:30',
//     provider: 'SKY',
//     squadra_casa: 'Cagliari',
//     squadra_ospiti: 'Benevento'
//   },
//   {
//     data: '06/01/2021',
//     ora: '15:00',
//     provider: 'SKY',
//     squadra_casa: 'Atalanta',
//     squadra_ospiti: 'Parma'
//   },
//   {
//     data: '06/01/2021',
//     ora: '15:00',
//     provider: 'DAZN',
//     squadra_casa: 'Bologna',
//     squadra_ospiti: 'Udinese'
//   },
//   {
//     data: '06/01/2021',
//     ora: '15:00',
//     provider: 'SKY',
//     squadra_casa: 'Crotone',
//     squadra_ospiti: 'Roma'
//   },
//   {
//     data: '06/01/2021',
//     ora: '15:00',
//     provider: 'DAZN',
//     squadra_casa: 'Lazio',
//     squadra_ospiti: 'Fiorentina'
//   },
//   {
//     data: '06/01/2021',
//     ora: '15:00',
//     provider: 'SKY',
//     squadra_casa: 'Sampdoria',
//     squadra_ospiti: 'Inter'
//   },
//   {
//     data: '06/01/2021',
//     ora: '15:00',
//     provider: 'SKY',
//     squadra_casa: 'Sassuolo',
//     squadra_ospiti: 'Genoa'
//   },
//   {
//     data: '06/01/2021',
//     ora: '15:00',
//     provider: 'SKY',
//     squadra_casa: 'Torino',
//     squadra_ospiti: 'Hellas Verona'
//   },
//   {
//     data: '06/01/2021',
//     ora: '18:00',
//     provider: 'DAZN',
//     squadra_casa: 'Napoli',
//     squadra_ospiti: 'Spezia'
//   },
//   {
//     data: '06/01/2021',
//     ora: '20:45',
//     provider: 'SKY',
//     squadra_casa: 'Milan',
//     squadra_ospiti: 'Juventus'
//   }
// ]
async function getDataOfMatches(url){
  // getting source coude of the html page
  const source = await getSource(url);
  let $ = cheerio.load(source);

  // Estraggo i dati relativi alla giornata IN CORSO
  let giornata = $(".risultati > h3").text().trim();
  let numero_giornata = giornata.split("-")[0].substring(0, 2);
  giornata = giornata.split("-")[1];
  let date = new Date(giornata);
  giornata = {
    date,
    numero_giornata
  }

  let results = [];
  results.push(giornata)

  let boxs_partite = $('.box-partita').each(function(i, item){

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


(async () => {

  console.log(await getDataOfMatches(calendario_url))

})();
