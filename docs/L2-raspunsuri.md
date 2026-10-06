# Laborator 2 - Raspunsuri

## 1. De ce folosim isActive: false in loc sa stergem produsul din fisier?

Pentru ca produsul ramane salvat si poate fi folosit mai tarziu daca este nevoie.
Practic il ascund din aplicatie fara sa pierd datele lui.

## 2. De ce cosul pastreaza o copie a pretului in loc sa citeasca mereu pretul din catalog?

Pentru ca pretul produsului se poate schimba intre timp.
In cos ramane pretul din momentul in care produsul a fost adaugat.

## 3. Ce s-ar intampla daca handler-ul 404 ar fi inregistrat inaintea rutelor?

Ar prinde cererile inainte sa ajunga la rutele corecte.
Din cauza asta aproape toate cererile ar primi raspuns 404.

## 4. Ce avantaje ar avea inlocuirea fisierelor JSON cu MongoDB? Ce s-ar schimba in readCatalog()?

MongoDB ar fi mai potrivit pentru mai multe date si pentru modificari mai dese.
Datele ar fi mai usor de cautat, adaugat si actualizat.

readCatalog() nu ar mai citi fisierul books.json, ci ar lua datele din baza de date MongoDB.
