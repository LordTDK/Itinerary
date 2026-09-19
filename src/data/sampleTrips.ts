import { addDays, getTodayString } from '../utils/dateUtils';
import { parseItineraryCSV } from '../utils/csvParser';
import { ItineraryData } from '../types';

export const COTSWOLDS_SPREADSHEET_CSV = `From,To,Date,Departure,Arrival,Duration,Notes,STAY DURATION,Costs,FromLong,FromLat,ToLong,ToLat
Poole,Castle Combe,20/09/2026,07:00,09:00,02:00:00,SN14 7HH,02:00:00,£ 0.80,-1.987000,50.715000,-2.224300,51.495200
Castle Combe,Broadway,20/09/2026,11:00,12:30,01:30:00,Lunch @ Broadway,02:00:00,,-2.224300,51.495200,-1.860000,52.040000
Broadway,Stow-on-the-Wold,20/09/2026,14:30,15:00,00:30:00,Tesco's for supper,01:00:00,,-1.860000,52.040000,-1.723820,51.930080
Stow-on-the-Wold,Hawkstone Brewery,20/09/2026,16:00,16:15,00:15:00,Brewery shop,01:00:00,,-1.723820,51.930080,-1.763002,51.893929
Hawkstone Brewery,Priors Road,20/09/2026,17:15,17:45,00:30:00,Accommodation,N/A,,-1.763002,51.893929,-2.049962,51.904992
Priors Road,Bibury,21/09/2026,07:15,08:00,00:45:00,Arlington Row,01:00:00,,-2.049962,51.904992,-1.832400,51.758200
Bibury,Bourton-on-the-water,21/09/2026,09:00,09:30,00:30:00,,03:00:00,,-1.832400,51.758200,-1.750000,51.866700
Bourton-on-the-water,Stow-on-the-Wold,21/09/2026,12:30,12:45,00:15:00,"Doors of Durin, Porch House, Tures",04:00:00,,-1.750000,51.866700,-1.723820,51.930080
Stow-on-the-Wold,Priors Road,21/09/2026,16:45,17:15,00:30:00,,N/A,,-1.723820,51.930080,-2.049962,51.904992
Priors Road,Burford,22/09/2026,08:00,08:30,00:30:00,Burford high street,01:30:00,,-2.049962,51.904992,-1.636600,51.807800
Burford,Minster Lovell,22/09/2026,10:00,10:15,00:15:00,Minster lovell ruins,01:00:00,,-1.636600,51.807800,-1.536700,51.798300
Minster Lovell,Witney,22/09/2026,11:15,11:30,00:15:00,Witney wool mill/shop,01:30:00,,-1.536700,51.798300,-1.485400,51.785800
Witney,Woodstock,22/09/2026,13:00,13:30,00:30:00,Lunch @ woodstock / Blenheim palace walk,02:00:00,,-1.485400,51.785800,-1.353300,51.848300
Woodstock,43 Valence Cres,22/09/2026,15:30,16:00,00:30:00,Accommodation,N/A,,-1.353300,51.848300,-1.238400,51.776500
43 Valence Cres,Salisbury,23/09/2026,08:30,10:15,01:45:00,Salisbury Cathedral & historic market,02:30:00,,-1.238400,51.776500,-1.795000,51.069000
Salisbury,Poole,23/09/2026,12:45,14:00,01:15:00,Return journey home,N/A,,-1.795000,51.069000,-1.987000,50.715000
`;

export function createCotswoldsTrip(): ItineraryData {
  return parseItineraryCSV(COTSWOLDS_SPREADSHEET_CSV, 'Cotswolds Holiday Tour');
}

export function createActiveJapanTrip(): ItineraryData {
  const today = getTodayString();
  const dayMinus2 = addDays(today, -2);
  const dayMinus1 = addDays(today, -1);
  const day0 = today; // Today!
  const dayPlus1 = addDays(today, 1);
  const dayPlus2 = addDays(today, 2);
  const dayPlus3 = addDays(today, 3);
  const dayPlus4 = addDays(today, 4);
  const dayPlus5 = addDays(today, 5);

  const csv = `Date,Time,Location,Activity,Category,Accommodation,Notes,Cost
${dayMinus2},09:30,Tokyo (Haneda),Arrival flight & Welcome Suica card pickup,Flight,Hotel Groove Shinjuku,Terminal 3 Gate 112,¥2000
${dayMinus2},14:00,Tokyo (Shinjuku),Check-in & Shinjuku Gyoen National Garden walk,Hotel,Hotel Groove Shinjuku,Luggage stored at front desk,¥500
${dayMinus2},19:00,Tokyo (Omoide Yokocho),Yakitori & Craft Beer in Memory Lane,Food,Hotel Groove Shinjuku,Cash only stall recommended,$35
${dayMinus1},08:30,Tokyo (Asakusa),Senso-ji Temple & Nakamise shopping street,Sightseeing,Hotel Groove Shinjuku,Early morning before peak tour groups,Free
${dayMinus1},13:00,Tokyo (Akihabara),Electric Town exploration & retro arcade gaming,Activity,Hotel Groove Shinjuku,Radio Kaikan multi-floor collectibles,$20
${dayMinus1},18:30,Tokyo (Ginza),Sushi Omakase culinary dinner experience,Food,Hotel Groove Shinjuku,Reservation confirmed ref: GIN-482,$110
${day0},09:00,Tokyo (Shibuya),Shibuya Crossing & Shibuya Sky 360 Observatory,Sightseeing,Cerulean Tower Tokyu Hotel,Timed entry ticket at 09:30 on phone,$18
${day0},12:30,Tokyo (Harajuku),Meiji Jingu Shrine forest walk & Takeshita Crepes,Sightseeing,Cerulean Tower Tokyu Hotel,Peaceful camphor tree promenade,$12
${day0},15:30,Tokyo (Roppongi),Mori Art Museum & Tokyo Tower sunset terrace,Sightseeing,Cerulean Tower Tokyu Hotel,52nd floor observation deck,¥2200
${day0},20:00,Tokyo (Ebisu),Izakaya evening dinner & Japanese highballs,Food,Cerulean Tower Tokyu Hotel,Table booked under Stephen,$45
${dayPlus1},08:45,Tokyo to Hakone,Odakyu Romancecar scenic train journey,Transport,Gora Kadan Ryokan,Car 2 Observation Deck seats,$32
${dayPlus1},13:00,Hakone (Lake Ashi),Sightseeing cruise & Hakone Shrine Torii gate on water,Sightseeing,Gora Kadan Ryokan,Mt. Fuji photo opportunity,Included
${dayPlus1},17:30,Hakone (Gora),Traditional 9-course Kaiseki dinner & Private Onsen,Hotel,Gora Kadan Ryokan,Yukata provided in room,Included
${dayPlus2},10:15,Hakone to Kyoto,Shinkansen Nozomi bullet train to Kyoto,Transport,The Thousand Kyoto,Car 6 Row 14 Window seats,$95
${dayPlus2},14:30,Kyoto (Gion),Historic preservation district & Geisha quarter stroll,Sightseeing,The Thousand Kyoto,Hanamikoji street photography,Free
${dayPlus2},18:30,Kyoto (Pontocho),Kamo River riverside dining on wooden terrace,Food,The Thousand Kyoto,Kawayuka seasonal dining booked,¥9000
${dayPlus3},07:30,Kyoto (Arashiyama),Bamboo Forest sunrise walk & Tenryu-ji Temple,Sightseeing,The Thousand Kyoto,Beat the crowds by arriving before 8am,¥500
${dayPlus3},13:00,Kyoto (Kinkaku-ji),The Golden Pavilion & zen garden reflection,Sightseeing,The Thousand Kyoto,Matcha & wagashi sweet at teahouse,¥400
${dayPlus3},16:00,Kyoto (Fushimi Inari),Hike through 10000 vermilion Torii gates,Activity,The Thousand Kyoto,Sunset view from Yotsutsuji intersection,Free
${dayPlus4},11:00,Kyoto to Osaka,Rapid train transfer to Osaka Dotonbori,Transport,Swissotel Nankai Osaka,Transfer time 35 minutes,¥580
${dayPlus4},15:00,Osaka (Castle Park),Osaka Castle Keep & historic stone ramparts,Sightseeing,Swissotel Nankai Osaka,Museum exhibition level 7,¥600
${dayPlus4},19:00,Osaka (Dotonbori),Street Food Safari: Takoyaki Kushikatsu & Glico sign,Food,Swissotel Nankai Osaka,Try Daruma Kushikatsu,$30
${dayPlus5},10:00,Osaka (Shinsekai),Tsutenkaku Tower & Retro souvenir shopping,Sightseeing,Swissotel Nankai Osaka,Luggage storage until airport,Free
${dayPlus5},16:30,Osaka (KIX Airport),Haruka Express to Kansai Airport & Departure flight,Flight,Departure Home,Terminal 1 Flight NH882,Included
`;

  return parseItineraryCSV(csv, 'Japan Autumn Journey: Tokyo, Hakone, Kyoto & Osaka');
}

export function createEuropeSummerTrip(): ItineraryData {
  const today = getTodayString();
  const day0 = today;
  const dayPlus1 = addDays(today, 1);
  const dayPlus2 = addDays(today, 2);
  const dayPlus3 = addDays(today, 3);
  const dayPlus4 = addDays(today, 4);
  const dayPlus5 = addDays(today, 5);

  const csv = `Date,Time,Location,Activity,Category,Accommodation,Notes,Cost
${day0},10:00,Rome (Colosseum),Ancient Rome VIP Gladiators Gate & Forum tour,Sightseeing,Hotel Artemide Rome,Skip-the-line voucher ref: ROM-7712,€45
${day0},14:00,Rome (Trevi),Trevi Fountain coin toss & Gelato at San Crispino,Sightseeing,Hotel Artemide Rome,Walk through Piazza Navona,€10
${day0},19:30,Rome (Trastevere),Handmade cacio e pepe dinner at Osteria Da Enzo,Food,Hotel Artemide Rome,Arrive early to queue,€35
${dayPlus1},08:30,Rome (Vatican City),St. Peter's Basilica Dome climb & Vatican Museums,Sightseeing,Hotel Artemide Rome,Dress code shoulders and knees covered,€28
${dayPlus1},15:00,Rome to Florence,Frecciarossa high-speed train,Transport,Grand Hotel Cavour Florence,Executive Coach 3 Seat 11,€49
${dayPlus1},19:00,Florence (Duomo),Rooftop aperitivo overlooking Brunelleschi's Dome,Food,Grand Hotel Cavour Florence,Sunset cocktails table booked,€30
${dayPlus2},09:30,Florence (Uffizi),Botticelli's Birth of Venus & Renaissance gallery,Sightseeing,Grand Hotel Cavour Florence,Audio guide booked,€26
${dayPlus2},14:00,Florence to Chianti,Tuscan wine tasting tour & olive grove lunch,Activity,Grand Hotel Cavour Florence,Private minivan pickup from hotel,€95
${dayPlus3},10:00,Florence to Venice,Italo express train to Venezia Santa Lucia,Transport,Hotel Danieli Venice,Arrival over Venetian lagoon,€52
${dayPlus3},14:30,Venice (Grand Canal),Gondola cruise along hidden canals & Rialto Bridge,Sightseeing,Hotel Danieli Venice,Traditional private gondolier,€80
${dayPlus3},19:30,Venice (St. Mark's),Dinner at Caffè Florian with live orchestra,Food,Hotel Danieli Venice,Historic cafe founded 1720,€65
${dayPlus4},09:00,Venice (Murano & Burano),Lace-making island & glass-blowing demonstration,Activity,Hotel Danieli Venice,Vaporetto day pass included,€25
${dayPlus5},11:00,Venice (Marco Polo Airport),Water taxi departure to airport,Transport,Flight Home,Water taxi ref: VCE-889,€40
`;

  return parseItineraryCSV(csv, 'Classic Italy Highlights: Rome, Florence & Venice');
}
