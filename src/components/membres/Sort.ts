export default function<T>(array: T[], order: 'asc' | 'desc', check: (t: T) => any) {
    const asc = order == 'asc';

    const merge = (part1: T[], part2: T[], list: T[], start: number, end: number) => {
        const data: any[] = [];
        let i = 0, j = 0;
        while(i < part1.length || j < part2.length) {
            if(j >= part2.length || (
                i < part1.length && (
                    (asc && check(part1[i]) < check(part2[j])) || 
                    (!asc && check(part1[i]) >= check(part2[j]))
                )
            )) {
                data.push(part1[i++])
            } else if(j < part2.length) {
                data.push(part2[j++]);
            }
        }

        for(i = start; i < end; ++i) {
            list[i] = data[i];
        }

        return data;
    }

    const partitioning = (list: T[]): T[] => {
        if(list.length > 1) {
            const len = list.length;
            const mid = Math.round(len / 2);

            const part1 = partitioning(list.slice(0, mid));
            const part2 = partitioning(list.slice(mid, len));

            return merge(part1, part2, list, 0, len);
        }
        return list
    };

    return partitioning(array);
}