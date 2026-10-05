window.LUPIN_CONFIG={
 apiBase:'https://YOUR-LUPIN-DATA-API.example',
 brand:{name:'LUPIN AIRLINES',logo:'https://img.pokemondb.net/artwork/scraggy.jpg',home:'home/'},
 topbar:{
  showClock:true,
  nav:[
   ['Home','home/'],['Flights','flights/'],['Destinations','destinations/'],['Book','booking/'],
   ['Experience','experience/'],['Baggage','baggage/'],['About','about/'],['Lupin Miles','miles/'],
   ['Flight Status','status/'],['Our Fleet','fleet/'],['Cabins','cabins/'],['Careers','careers/'],
   ['Airport Map','airport-map/'],['Contact','contact/']
  ],
  account:{label:'Account',href:'account/',icon:'👤'},
  cta:{label:'Book now',href:'booking/',enabled:true}
 },
 privacyBanner:{
  enabled:true,
  title:'Privacy update',
  text:'Previous Lupin Airlines account data has been retired. New accounts and bookings are supported, and information needed to operate your account is stored securely.',
  linkText:'Learn more',
  href:'about/'
 }
};