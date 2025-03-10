import { createStorage } from "unstorage";
import localStorageDriver from "unstorage/drivers/localstorage";

const storage = createStorage({
    driver: localStorageDriver({ base: ".:" }),
});

export default storage;