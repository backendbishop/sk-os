// Registers all commands into the registry on import.
// Add new commands here — one line per command.

import { registry } from './registry';
import { help }      from './impl/help';
import { ls }        from './impl/ls';
import { cd }        from './impl/cd';
import { pwd }       from './impl/pwd';
import { cat }       from './impl/cat';
import { open }      from './impl/open';
import { processes } from './impl/processes';
import { kill }      from './impl/kill';
import { services }  from './impl/services';
import { logs }      from './impl/logs';
import { search }    from './impl/search';
import { clear }     from './impl/clear';
import { shutdown }  from './impl/shutdown';
import { whoami }    from './impl/whoami';
import { neofetch }  from './impl/neofetch';

registry.register(help);
registry.register(ls);
registry.register(cd);
registry.register(pwd);
registry.register(cat);
registry.register(open);
registry.register(processes);
registry.register(kill);
registry.register(services);
registry.register(logs);
registry.register(search);
registry.register(clear);
registry.register(shutdown);
registry.register(whoami);
registry.register(neofetch);

export { registry };
