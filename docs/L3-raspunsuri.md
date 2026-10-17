# Laborator 3 - Raspunsuri

## 1. De ce callback-ul din useEffect nu poate fi async?

Callback-ul din useEffect nu trebuie sa fie async pentru ca useEffect trebuie sa returneze fie nimic, fie o functie de cleanup. O functie async returneaza automat un Promise.

De aceea, in interiorul useEffect putem defini o functie async separata si apoi sa o apelam.

## 2. Ce se intampla daca folosim index ca key in map si lista este sortata?

Daca folosim index-ul ca key, dupa sortare React poate asocia gresit elementele din lista cu componentele deja existente.

De aceea este mai bine sa folosim un id unic, de exemplu:

```jsx
<ProductCard key={product.id} product={product} />
```
