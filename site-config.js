window.LUPIN_CONFIG={
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
 },
 flights:[
  {code:'LP 001',destination:"Lupin's House",time:'08:15',gate:'L',price:101,status:'Scheduled'},
  {code:'LP 002',destination:"Mdm Wrong-Wrong's House",time:'09:45',gate:'WW',price:202,status:'Scheduled'},
  {code:'LP 003',destination:'Somewhere Good',time:'11:00',gate:'G',price:303,status:'Scheduled'},
  {code:'LP 004',destination:'Somewhere Better',time:'12:30',gate:'B',price:404,status:'Scheduled'},
  {code:'LP 005',destination:'Somewhere Even Better',time:'14:00',gate:'EB',price:505,status:'Scheduled'},
  {code:'LP 006',destination:'Somewhere Best',time:'16:20',gate:'BEST',price:606,status:'Scheduled'},
  {code:'LP 000',destination:'Somewhere Worst',time:'23:59',gate:'WORST',price:0,status:'Proceed with caution'},
  {code:'LP 404',destination:'Somewhere Nice',time:'09:00',gate:'???',price:404,status:'Scheduled'},
  {code:'LP 007',destination:"Scraggy's House",time:'11:30',gate:'7¾',price:79,status:'Scheduled'},
  {code:'LP 314',destination:'Singapore, Probably',time:'14:20',gate:'12',price:314,status:'Scheduled'},
  {code:'LP 9001',destination:'The Moon',time:'23:59',gate:'space',price:9001,status:'Delayed since Tuesday'}
 ]
};