// Deletes a user from the DB
async function deleteUser(username){
    try{
        const response = await fetch(`/admin/user/${username}`, { // Chase used chat to write this. That's why it uses the nasty .then syntax
            method: 'DELETE',
            credentials: 'same-origin'
        });
        if (!response.ok){
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        console.log(json);
    } catch(error){
        console.error(error);
    }
}
