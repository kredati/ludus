import Ludus from './signed/mod.js';

import List from './ludus/list.js';

Ludus.globalize('Ludus', Ludus);
Ludus.globalize('List', List);
Ludus.globalize('list', List.list);

export default Ludus;