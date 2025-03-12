export type SerializableMembre = Omit<Membre, 'pass' | 'id'> & {
    id: string,
}

export const MembreUninstanciator = (m: Omit<Membre, 'pass'>): SerializableMembre => {
    return {
        ...m,
        id: m.id.id.toString()
    }
}

// Attends jusqu'à ce que la condition soit validée
export async function until(exists: () => boolean, timeout?: number, timeoutCb?: () => void): Promise<void> {
    if(timeout && timeoutCb) {
        setTimeout(() => {
            if(!exists()) {
                timeoutCb()
            }
        }, timeout);
    }
    
    await new Promise((resolve) => {
        const intervalId = setInterval(() => {
            if(exists()) {
                clearInterval(intervalId); // Stop checking
                resolve(true); // Resolve the promise
            }
        }, 25); // Check every 100ms (adjust as needed)
    })
}