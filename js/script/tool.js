/**
 * Created by 75932 on 2017/5/16.
 */
export const regEmail = (email) => {
    const reEmail = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/
    if (reEmail.test(email))
        return true;
    return false;
}