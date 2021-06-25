import Ludus from './signed/mod.js';

Ludus.globalize('Ludus', Ludus);

import List from './ludus/list.js';

Ludus.globalize('List', List);
Ludus.globalize('list', List.list);

import {doc} from './ludus/doc.js';

Ludus.globalize('doc', doc);

export default Ludus;