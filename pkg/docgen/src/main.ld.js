//////////////////// @ludus/docgen
// Documentation generator for Ludus

import "@ludus/prelude";

let doc_target = "../../../doc/";

let ludus_nses = filter(is_ns, values(members(Ludus)));

let ludus_fns = filter(is_fn, values(members(Ludus)));

let pre_ify = (str) => `\`${str}\``;

let is_arity = (str) => eq('(', first(str));

let format = (line) => when(is_arity(line))
  ? str(pre_ify(line), "<br/>")
  : str(line, "\n");

let generate_fn_entry = (fn) => {
  let fn_doc = doc(fn);
  let lines = split("\n", fn_doc); //?
  let header = `### \`${get("name", fn)}::${get_in(fn, ["type", "name"], "fn")}\``; 
  let body = rest(lines);
  let entry = Str.from([header, ...map(format, body)], "\n");
  return entry;
};

let get_ns_name = (ns) => get("name", meta(ns));

let format_ns_link = (ns) => {
  let name = get_ns_name(ns);
  return `[\`${name}::ns\`](${name}.md)`;
};

let generate_ns_entry = (ns) => {
  let ns_members = filter(is_ns, values(members(ns)));
  let fn_members = filter(is_fn, values(members(ns)));
  let other_members = keys(filter(([_, v]) => not(or(is_fn(v), is_ns(v))), members(ns)));
  let header = `# \`${get_ns_name(ns)}::ns\``;
  let toc = `Jump to: [Namespaces](#Namespaces), [Functions](#Functions), [Values](#Values)\n\n`;
  let ns_header = "## Namespaces";
  let ns_links = Str.from(Arr.sort(map(format_ns_link, ns_members)), "<br/>\n");
  let fn_header = "## Functions";
  let fn_docs = Str.from(Arr.sort(map(generate_fn_entry, fn_members)), "\n");
  let values_header = "## Values";
  let value_members = Str.from(map((name) => `\`${name}\``, other_members), "<br/>\n");
  return Str.from([header, toc, ns_header, ns_links, fn_header, fn_docs, values_header, value_members], "\n");
};

filter((or(is_ns, is_fn)), values(members(Ludus))); //?
generate_ns_entry(Ludus); //?