import { Logger, ILogObj } from 'tslog';

const logger: Logger<ILogObj> = new Logger({
    type: "pretty"
});

export default logger;