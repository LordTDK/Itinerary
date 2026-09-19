import { parseItineraryCSV } from '../utils/csvParser';
import { ItineraryData } from '../types';

export const COTSWOLDS_CSV_RAW = `From,To,Date,Departure,Arrival,Duration,Notes,STAY DURATION,Costs,FromLong,FromLat,ToLong,ToLat
Poole,Castle Combe,20/09/2026,07:00,09:00,02:00:00,SN14 7HH,02:00:00,£ 0.80,-1.987000,50.715000,-2.224300,51.495200
Castle Combe,Broadway,20/09/2026,11:00,12:30,01:30:00,Lunch @ Broadway,02:00:00,,-2.224300,51.495200,-1.860000,52.040000
Broadway,Stow-on-the-Wold,20/09/2026,14:30,15:00,00:30:00,Tesco's for supper,01:00:00,,-1.860000,52.040000,-1.723820,51.930080
Stow-on-the-Wold,Hawkstone Brewery,20/09/2026,16:00,16:15,00:15:00,Brewery shop,01:00:00,,-1.723820,51.930080,-1.763002,51.893929
Hawkstone Brewery,Priors Road,20/09/2026,17:15,17:45,00:30:00,Accommodation,N/A,,-1.763002,51.893929,-2.049962,51.904992
Priors Road,Bibury,21/09/2026,07:15,08:00,00:45:00,Arlington Row,01:00:00,,-2.049962,51.904992,-1.832400,51.758200
Bibury,Bourton-on-the-water,21/09/2026,09:00,09:30,00:30:00,,03:00:00,,-1.832400,51.758200,-1.750000,51.866700
Bourton-on-the-water,Stow-on-the-Wold,21/09/2026,12:30,12:45,00:15:00,"Doors of Durin, Porch House, Tures",04:00:00,,-1.750000,51.866700,-1.723820,51.930080
Stow-on-the-Wold,Priors Road,21/09/2026,16:45,17:15,00:30:00,,N/A,,-1.723820,51.930080,-2.049962,51.904992
Priors Road,Rollright Stones,22/09/2026,07:15,08:00,00:45:00,,00:45:00,,-2.049962,51.904992,-1.570654,51.975727
Rollright Stones,Didly Squat Farm Shop,22/09/2026,08:45,09:00,00:15:00,,01:00:00,,-1.570654,51.975727,-1.541525,51.916245
Didly Squat Farm Shop,Witney,22/09/2026,10:00,10:30,00:30:00,,01:00:00,,-1.541525,51.916245,-1.485400,51.783600
Witney,43 Valence Cres,22/09/2026,11:30,11:40,00:10:00,,00:00:00,,-1.485400,51.783600,-1.508998,51.788187
43 Valence Cres,The Farmer's Dog,22/09/2026,11:40,11:55,00:15:00,,04:00:00,,-1.508998,51.788187,-1.584047,51.789616
The Farmer's Dog,43 Valence Cres,22/09/2026,15:55,16:10,00:15:00,,N/A,,-1.584047,51.789616,-1.508998,51.788187
43 Valence Cres,Designer Outlet Swindon,23/09/2026,09:30,10:30,01:00:00,,02:30:00,,-1.508998,51.788187,-1.798120,51.562450
Designer Outlet Swindon,Salisbury,23/09/2026,13:00,14:15,01:15:00,,03:00:00,,-1.798120,51.562450,-1.795000,51.069000
Salisbury,The Royal Oak,23/09/2026,17:15,17:45,00:30:00,,02:15:00,,-1.795000,51.069000,-2.051619,51.043324
The Royal Oak,Poole,23/09/2026,20:00,21:00,01:00:00,,N/A,,-2.051619,51.043324,-1.987000,50.715000`;

export function createCotswoldsTrip(): ItineraryData {
  return parseItineraryCSV(COTSWOLDS_CSV_RAW, 'Cotswolds Holiday Tour');
}
