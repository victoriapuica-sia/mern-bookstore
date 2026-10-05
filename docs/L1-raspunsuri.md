# Laborator 1 - Raspunsuri

## 1. Care este diferenta dintre dependencies si devDependencies? Dati cate un exemplu din proiect.

dependencies sunt pachetele de care aplicatia are nevoie ca sa functioneze.
De exemplu, in proiectul meu am express.

devDependencies sunt pachetele folosite mai mult in timpul dezvoltarii.
De exemplu, am nodemon.

## 2. De ce package-lock.json se urca in Git, iar node_modules nu?

package-lock.json pastreaza versiunile pachetelor instalate, de aceea se urca in Git.

node_modules nu se urca pentru ca ocupa mult spatiu si poate fi creat din nou cu npm install.

## 3. Ce s-ar intampla daca .env ar fi urcat pe GitHub intr-un depozit public?

In .env pot fi chei si alte date secrete.
Daca il urc pe un repository public, aceste date pot fi vazute si de alte persoane.

## 4. De ce frontend-ul si backend-ul ruleaza pe porturi diferite si ce problema vom avea din acest motiv?

Frontend-ul si backend-ul sunt doua parti diferite ale aplicatiei si ruleaza separat.

La mine frontend-ul ruleaza pe portul 5173, iar backend-ul pe 3000.
Din cauza porturilor diferite poate aparea problema CORS, de aceea backend-ul trebuie sa permita cererile de la frontend.
