export type SerializableMembre = Omit<Membre, 'pass' | 'id'> & {
    id: string,
}

export const MembreUninstanciator = (m: Omit<Membre, 'pass'>): SerializableMembre => {
    return {
        ...m,
        id: m.id ? m.id.id.toString() : ''
    }
}

// Attends jusqu'à ce que la condition soit validée
export async function until(exists: () => boolean, interval: number = 100): Promise<void> {
    await new Promise((resolve) => {
        const intervalId = setInterval(() => {
            if(exists()) {
                clearInterval(intervalId); // Stop checking
                resolve(true); // Resolve the promise
            }
        }, interval); // Check every 100ms (adjust as needed)
    })
}