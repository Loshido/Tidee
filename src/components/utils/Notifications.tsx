import { component$, useStyles$ } from "@builder.io/qwik";

interface Props {
    notifications: Notification[]
}

export interface Notification {
    id?: number,
    contenu: string,
    style?: string,
    progress_style?: string
    duration: number
}

const style = `
@keyframes progress {
    from {
        width: var(--from)
    }
    to {
        width: 0;
    }
}

.progress-bar{
    animation: progress var(--duration) linear;
}
`

export default component$(({ notifications }: Props) => {
    useStyles$(style);
    return <div class="fixed top-4 right-4 flex flex-col gap-2 z-[1000]"
        style={{
            maxWidth: "calc(100% - 2rem)"
        }}>
        {
            notifications.map((notif, i) => <div key={i}
                class={[
                    notif.style ? notif.style : 'bg-white',
                    "px-2 py-1.5 border rounded text-sm"
                ]}>
                {
                    notif.contenu
                }
                <div class={["h-0.5 -mb-1.5 -mx-2 mt-1",
                    "rounded progress-bar",
                    notif.progress_style ? notif.progress_style : 'bg-black bg-opacity-15']}
                    style={`--from: calc(100% + 16px); --duration: ${notif.duration}s`}/>
            </div>)
        }
    </div>
})