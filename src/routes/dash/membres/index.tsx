import { component$, PropsOf, Slot } from "@builder.io/qwik";
import { RecordId } from "surrealdb";

interface Membre {
    id: RecordId
    email: string,
    heures: number,
    nom: string,
    poles: RecordId[],
    prenom: string,
    promotion: string
}

async function until(exists: () => boolean): Promise<void> {
    await new Promise((resolve) => {
        const intervalId = setInterval(() => {
            if(exists()) {
                clearInterval(intervalId); // Stop checking
                resolve(true); // Resolve the promise
            }
        }, 100); // Check every 100ms (adjust as needed)
    })
}

export const Cell = component$((props: PropsOf<'div'>) => <div 
    {...props} 
    class={[props.class, "px-3 py-1.5 border"]}>
    <Slot/>
</div>)

import { faker } from "@faker-js/faker";
import "./style.css"
import Filtres from "./Filtres";
export default component$(() => {
    return <div>
        <header class="p-5">
            <h1 class="font-black text-4xl leading-relaxed lg">
                Membres
            </h1>
            <p class="text-lg font-light">
                Liste des membres de l'association 
                <i class="text-sm"> (Notez que la liste peut vous être restreinte.)</i>
            </p>
        </header>

        <Filtres/>
        <table class="mt-4 text-sm w-full" id="membres">
            <thead class="font-semibold *:cursor-pointer select-none">
                <tr>
                    <th>Email</th>
                    <th>Nom</th>
                    <th>Prenom</th>
                    <th>Heures</th>
                    <th>Poles</th>
                    <th>Promotion</th>
                </tr>
            </thead>
            <tbody>
                {
                    new Array(500).fill(0).map((_, i) => i).map(e => <tr
                        onDblClick$={() => {
                            console.log(e)
                        }}
                        key={e}>
                        <td>{faker.internet.email()}</td>
                        <td>{faker.person.lastName()}</td>
                        <td>{faker.person.firstName()}</td>
                        <td>0h</td>
                        <td>{faker.company.buzzNoun()}</td>
                        <td>{faker.company.buzzNoun()}</td>
                    </tr>)
                }
            </tbody>
        </table>

        {/* <ul class="list-inside list-disc ml-2">
            <li>
                Filtres par pôle, heures, Nom, Prénom, Email...
            </li>
            <li>
                Trier par pôle, heures, nom, prénom...
            </li>
            <li>
                Possibilité aux responsables de modifier les entrées
            </li>
        </ul> */}
    </div>
})