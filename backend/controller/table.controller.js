class PersonController {
    constructor(db) {
        this.db = db;
    }

    async getTables(req, res) {
        const { user_id } = req.query;
        const client = await this.db.connect();
        try {
            const tables = await client.query(
                `select * from tables_list where user_id = $1;`,
                [user_id]
            );
            res.status(201).json(tables.rows);
        } catch (error) {
            console.error(error);
        } finally {
            client.release();
        }
    }
}

module.exports = PersonController;