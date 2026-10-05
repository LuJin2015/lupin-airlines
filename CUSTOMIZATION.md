# Lupin Airlines customization

Most site-wide customization lives in **site-config.js**.

## Add a flight

Append one object to `LUPIN_CONFIG.flights`:

```js
{code:'LP 123',destination:'Somewhere New',time:'13:37',gate:'NEW',price:123,status:'Scheduled'}
```

The Flights page automatically creates:
- the flight card
- price
- gate/time
- booking link
- live status
- map marker
- map label

The Booking page also gets the destination automatically.

## Change the top bar

Edit only `LUPIN_CONFIG.topbar.nav`:

```js
nav:[
  ['Home','home/'],
  ['Flights','flights/'],
  ['My New Page','new-page/']
]
```

Delete an entry to remove it. Reorder entries to reorder the bar.

You can also change:
- `brand.name`
- `brand.logo`
- `brand.home`
- `topbar.showClock`
- `topbar.account`
- `topbar.cta`
- `privacyBanner`

The top bar is rendered automatically on every page.

## Important

For production bookings, the same flight catalogue must also be present in the private `lupin-data/data/flights.json` because the server validates bookable flights.

Never put passwords, API secrets, or database credentials in `site-config.js`.
