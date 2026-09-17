const SHEET_NAME = 'Bookings';
const ADMIN_KEY = 'CHANGE_THIS_ADMIN_KEY';

function getSheet_(){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  let sheet=ss.getSheetByName(SHEET_NAME);
  if(!sheet) sheet=ss.insertSheet(SHEET_NAME);
  if(sheet.getLastRow()===0){
    sheet.appendRow(['Booking ID','Booked At','Passenger','Flight','Destination','Date','Time','Gate','Passengers','Fare']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}
function json_(data){
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
function doPost(e){
  try{
    const body=JSON.parse(e.postData.contents||'{}');
    const name=String(body.name||'').trim().slice(0,40);
    if(!name) return json_({ok:false,error:'Passenger name is required.'});
    if(!body.flight||!body.destination||!body.date) return json_({ok:false,error:'Missing booking information.'});
    const id='LUP-'+Utilities.getUuid().replace(/-/g,'').slice(0,6).toUpperCase();
    getSheet_().appendRow([id,new Date(),name,String(body.flight),String(body.destination),String(body.date),String(body.time||''),String(body.gate||''),String(body.passengers||''),Number(body.price)||0]);
    return json_({ok:true,bookingId:id});
  }catch(err){
    return json_({ok:false,error:String(err.message||err)});
  }
}
function doGet(e){
  try{
    const key=String((e.parameter&&e.parameter.key)||'');
    if(key!==ADMIN_KEY) return json_({ok:false,error:'Unauthorized.'});
    const sheet=getSheet_(),values=sheet.getDataRange().getDisplayValues();
    return json_({ok:true,bookings:values.length>1?values.slice(1).reverse():[]});
  }catch(err){
    return json_({ok:false,error:String(err.message||err)});
  }
}