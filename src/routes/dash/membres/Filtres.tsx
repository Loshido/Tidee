import { component$, PropsOf, Slot } from "@builder.io/qwik";
import { LuArrowDownWideNarrow, LuChevronDown, LuSearch } from "@qwikest/icons/lucide";

export const Item = component$((props: PropsOf<'div'>) => <div 
    {...props}
    class={["bg-black bg-opacity-5 flex flex-row gap-2",
        "px-2 py-1 rounded items-center select-none",
        "cursor-pointer hover:bg-opacity-10 transition-colors",
        props.class]}>
    <Slot/>
</div>)

export default component$(() => {
    return <div class="flex flex-row flex-wrap gap-2 w-fit items-center px-5 text-sm">
        <Item class="py-1.5 cursor-default">
            <LuSearch />
            <input type="text" autocomplete="off" autoComplete="off"
                class="bg-transparent outline-none" 
                placeholder="Rechercher un membre..."/>
        </Item>
        <Item>
            <LuChevronDown/>
            Poles
        </Item>
        <Item>
            <LuChevronDown/>
            Promotion
        </Item>
        <Item>
            <LuArrowDownWideNarrow/>
            Trie par Nom
        </Item>
    </div>
})