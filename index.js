// NOTE: copied from https://w3id.org/force/odrl3proposal - should be a package somewhere
const N3 = require('n3');
const { DataFactory, Parser, Store } = N3;
const { namedNode } = DataFactory;
const fs = require('fs')
const { parse } = require('rdf-dereference-store')

async function main(){
    // INPUTS
    const ttl = fs.readFileSync("trustenvelope.ttl", "utf8")
    const ontologyURI ='https://w3id.org/trustenvelope#'

    // code to generate the bikehsed
    const {store, prefixes} = await parse(ttl, {contentType: 'text/turtle'});
    const terms = store.getSubjects('http://www.w3.org/2000/01/rdf-schema#isDefinedBy', ontologyURI)
    console.log(terms.length);
    console.log(prefixes);

    for (const term of terms) {    
        console.log(generateBikeshedHTML(store, term.value, prefixes));
    }
}
main()


/**
 * Generates Bikeshed-style HTML from an RDF store and a subject IRI.
 * @param {N3.Store} store - An instance of N3.Store containing RDF triples.
 * @param {string} subjectIRI - The full IRI of the subject to describe.
 * @returns {string} - Bikeshed-style HTML snippet.
 */
function generateBikeshedHTML(store, subjectIRI, prefixes) {
  const subject = namedNode(subjectIRI);

  const getObjectValue = (predicateIRI) => {
    const quad = store.getQuads(subject, namedNode(predicateIRI), null, null)[0];
    return quad?.object.value || '';
  };

  const getObjectValues = (predicateIRI) => {
    return store.getQuads(subject, namedNode(predicateIRI), null, null).map(q => q.object.value);
  };


  const data = {
    iri: subjectIRI,
    label: getObjectValue('http://www.w3.org/2000/01/rdf-schema#label'),
    types: getObjectValues('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
    definition: getObjectValue('http://www.w3.org/2004/02/skos/core#definition'),
    domains: getObjectValues('http://www.w3.org/2000/01/rdf-schema#domain'),
    ranges: getObjectValues('http://www.w3.org/2000/01/rdf-schema#range'),
    note: getObjectValue('http://www.w3.org/2004/02/skos/core#scopeNote')
  };

    const lines = [
    `IRI: ${toMarkdownLink(data.iri, prefixes)}`,
    `Label: ${data.label}`,
    `Type: ${data.types.map(t => toMarkdownLink(t, prefixes)).join(', ')}`,
    `Definition: ${data.definition}`,
    data.domains.length ? `Domain: ${data.domains.map(d => toMarkdownLink(d, prefixes)).join(', ')}` : null,
    data.ranges.length ? `Range: ${data.ranges.map(r => toMarkdownLink(r, prefixes)).join(', ')}` : null,
    data.note ? `Note: ${data.note}` : null
  ].filter(Boolean);

  const rawHTML = 
`### ${capitalizeFirstLetter(data.label)} ### {#${data.label}}

<pre class=simpledef>\n${lines.join('\n')}\n</pre>
`;
  return rawHTML
}

/**
 * Converts a full IRI into a prefixed name using the provided prefix map.
 */
function toPrefixedName(iri, prefixes) {
  for (const [prefix, ns] of Object.entries(prefixes)) {
    if (iri.startsWith(ns)) {
      return `${prefix}:${iri.slice(ns.length)}`;
    }
  }
  return iri; // fallback to full IRI if no match
}

/**
 * Converts an IRI into a Markdown link with a prefixed label.
 */
function toMarkdownLink(iri, prefixes) {
  const label = toPrefixedName(iri, prefixes);
  return `[${label}](${iri})`;
}

/**
 * Capitalizes the first letter of the string.
 */
function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}