import { $, component$, PropsOf, Slot, useContext, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { RecordId } from "surrealdb";

interface Data {
    promotions: string[],
    poles: string[]
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
import { connectionCtx } from "~/routes/layout";
import { cache } from "~/lib/local";
export default component$(() => {
    const conn = useContext(connectionCtx)
    const data = useStore<Data>({
        poles: [],
        promotions: []
    })

    useVisibleTask$(async () => {
        await until(() => !!conn.value);

        const poles = await cache('list-poles', 60 * 24, async () => {
            const query = "SELECT nom FROM poles;";
            const response = await conn.value!.query<[{ nom: string }[]]>(query)
            return response[0].map(o => o.nom)
        });

        const promotions = await cache('list-promotion', 60 * 24, async () => {
            const query = "SELECT array::group(promotion) AS promotion FROM membres GROUP ALL";
            const response = await conn.value!.query<[{ promotion: string[] }[]]>(query);
            return response[0][0].promotion;
        })

        data.poles = poles;
        data.promotions = promotions;

        console.log(poles, promotions)
    })

    const recherche = $((query: string) => {
    });
    const filtres = $((poles: string[], promotions: string[]) => {
    })

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

        <Filtres
            promotions={data.promotions}
            poles={data.poles}
            recherche={recherche}
            filtres={filtres}/>
        <table class="mt-4 text-sm w-full" id="membres">
            <thead class="font-semibold *:cursor-pointer select-none">
                <tr>
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
                        <td>{faker.person.lastName()}</td>
                        <td>{faker.person.firstName()}</td>
                        <td>0h</td>
                        <td>{faker.company.buzzNoun()}</td>
                        <td>{faker.company.buzzNoun()}</td>
                    </tr>)
                }
            </tbody>
        </table>
    </div>
})