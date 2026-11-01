// Lista de paises (ISO 3166-1 alfa-2; igual a COUNTRIES em src/domain/importParser.ts) e nomes no idioma da pagina.
(function () {
  var CODES = ["AD","AE","AF","AG","AI","AL","AM","AO","AQ","AR","AS","AT","AU","AW","AX","AZ","BA","BB","BD","BE","BF","BG","BH","BI","BJ","BL","BM","BN","BO","BQ","BR","BS","BT","BV","BW","BY","BZ","CA","CC","CD","CF","CG","CH","CI","CK","CL","CM","CN","CO","CR","CU","CV","CW","CX","CY","CZ","DE","DJ","DK","DM","DO","DZ","EC","EE","EG","EH","ER","ES","ET","FI","FJ","FK","FM","FO","FR","GA","GB","GD","GE","GF","GG","GH","GI","GL","GM","GN","GP","GQ","GR","GS","GT","GU","GW","GY","HK","HM","HN","HR","HT","HU","ID","IE","IL","IM","IN","IO","IQ","IR","IS","IT","JE","JM","JO","JP","KE","KG","KH","KI","KM","KN","KP","KR","KW","KY","KZ","LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY","MA","MC","MD","ME","MF","MG","MH","MK","ML","MM","MN","MO","MP","MQ","MR","MS","MT","MU","MV","MW","MX","MY","MZ","NA","NC","NE","NF","NG","NI","NL","NO","NP","NR","NU","NZ","OM","PA","PE","PF","PG","PH","PK","PL","PM","PN","PR","PS","PT","PW","PY","QA","RE","RO","RS","RU","RW","SA","SB","SC","SD","SE","SG","SH","SI","SJ","SK","SL","SM","SN","SO","SR","SS","ST","SV","SX","SY","SZ","TC","TD","TF","TG","TH","TJ","TK","TL","TM","TN","TO","TR","TT","TV","TW","TZ","UA","UG","UM","US","UY","UZ","VA","VC","VE","VG","VI","VN","VU","WF","WS","XK","YE","YT","ZA","ZM","ZW"];
  var dn = null;
  try { dn = new Intl.DisplayNames([window.LOCALE || 'pt-BR'], { type: 'region' }); } catch (e) {}
  window.COUNTRY_CODES = CODES;
  window.countryName = function (c) {
    try { return (dn && dn.of(c)) || c; } catch (e) { return c; }
  };
  // Preenche um <select> com todos os paises, em ordem alfabetica do idioma atual.
  window.fillCountries = function (select) {
    var items = CODES.map(function (c) { return [c, window.countryName(c)]; });
    items.sort(function (a, b) { return a[1].localeCompare(b[1], window.LOCALE || 'pt-BR'); });
    items.forEach(function (it) {
      var o = document.createElement('option'); o.value = it[0]; o.textContent = it[1]; select.appendChild(o);
    });
  };
})();
