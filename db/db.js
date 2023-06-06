export const database = {
    users: {
        azick1222: {
            email: 'azick1222@gmail.com',
            password: '12345678',
            role: 'admin'
        },
    },
    posts: {

    }
};

export function writePost(data){
    let date = data.date;
    database.posts[date] = data;
}