import {writeFile} from 'fs/promises';
import Ludus from './main.js';

writeFile('ludus_globals.json', JSON.stringify(Ludus.globalized));