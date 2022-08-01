export class MongoDBConnectionURIBuilder {
    private protocol = '';
    private hostname = '';
    private port: number | string = '';
    private username = '';
    private password = '';
    private databaseName = '';
    private connectionParams = '';

    public setProtocol(protocol: string) {
        this.protocol = protocol;
        return this;
    }

    public setHostname(hostname: string) {
        this.hostname = hostname;
        return this;
    }

    public setPort(port: string | number) {
        this.port = ':' + port;
        return this;
    }

    public setUsername(username: string) {
        this.username = username;
        return this;
    }

    public setPassword(password: string) {
        this.password = password + '@';
        return this;
    }

    public setDatabaseName(dbName: string) {
        this.databaseName = dbName;
        return this;
    }

    public setConnectionParams(params: string) {
        this.connectionParams = params;
        return this;
    }

    public build() {
        return `${this.protocol}/${this.username}/${this.password}${this.hostname}${this.port}/${this.databaseName}?${this.connectionParams}`;
    }
}
