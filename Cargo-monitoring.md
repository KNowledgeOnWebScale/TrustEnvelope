# Cargo Monitoring Use Case

Beverage Company (BC) contracts Boxport to transport goods via inland waterways, 
at all times BC wants the location of the cargo in real-time to estimate the delivery time.
Waterway authorities monitor vessel movements and can verify location data.
This includes of course Bluewave, the vessel employed by Boxport to transport BC its cargo.

To monitor its fleet, Boxport requests access to this data.
The authority responds by issuing a Trust Envelope that encapsulates Bluewave's precise location at time *t*
and explicitly grants Boxport permission to use and distribute the data.

When BC requests the location of its cargo from Boxport,
the latter responds with a new Trust Envelope .
This envelope materializes the previously received 
Trust Envelope from the waterway authority into derived cargo spatio-temporal data, 
using it as the basis for a new, context-specific data unit.

See https://w3id.org/trustenvelope/#cargo-monitoring for materialization