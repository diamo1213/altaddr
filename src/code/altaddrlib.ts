/**
 * AltAddrLib library provides the first
 * available URL from the list of URLs related to a AltAddr URL
 *
 * Created by Almaz Khamatkhanov in 2017.
 *
 */
import * as Utils from './utils';
import * as Consts from './constants';

export interface Err {
    "error": {
        num: number,
        message: string,
        note?: string
    }
}

export interface Addr {
    "url": string,
    "confirmFileName": string
}

export interface InitOptions {
    version: number,
    requestMethod: string //"jsonp" or "xhr"
}

export class AltAddrLib {

    private initOptions: InitOptions;

    private i: any;

    private inited: boolean = false;

    private rootAddresses: Addr[] = Utils.getRootAddrs('JJ9DBagooQ88IuQl4CDjyc9g9Q3pw3XbdF293U8jEBuLLqTINnt7CwoSsdLrgL7eqwWMsrnJr+2b/WrVBx0+/d6eW0x3vLFHV4oTXkKJcqdxkIQkUfmUl59yJEdymNTxYEgMfMp0t8DyBxAEGKd1Neq/pAVC5IDpr+BRy/80dKHpVA1yFnn2rBQPeEir1IUuDV8nbULJKCSIHremcUjkCd7NuX+4mLooKzZqMA629FEHV0VDXdW9t2JDgmZJwDtWXea6VXE2DOCgse2XFCyaaLWTPDSpb4UVgBS9tR94uXaXFOZTui/s4lXRUaaQbFN46SrG0CpaBlj6y9V9RS5do4hO0aNRrH5+gc0qyvrEc5NaQzY5uvkJm3XbetU/8Ap9wR+OQiaGUWtEvAdEwcUsUeFq0mM6ifDJ2BB5GlIjOyC4oD9/ri9ciS4VSpVgyAYgEIzwjkrrfu5wSTR27tmHw/pqQjuvG84e5UJURQ0fy01G+qQqyLwpfFfPzfvVaAc7s997DLsVFdHfQi4xpeA3PVDa1AO7zU0l/JH8QBT1MXdAf1SisixXeCyBqks9YX/YJARx+Ojjnmt5JmZS4xT/fArhjctVGbWqLBk7puDNxUnyMJC6uiH7x8KfiTaKuFDXGO4RGm1iWV6pTx11fjhF9xNYOyYPO+fuOafFB+0tEfk=');

    private io: InitOptions = {version: 0, requestMethod: "jsonp"};

    private tmpFun: any;

    constructor(io: InitOptions) {

        if (Consts.versions.indexOf(io.version) >= 0) {
            this.io = io;
            this.inited = true;
        }
        else {
            console.error(Consts.errList["10"].error.message);
            return;
        }

        //this.test(JSON.stringify(io));

        if (typeof window !== 'object') {
            console.error(Consts.errList["11"].error.message);
            return;
        }
        else {
            this.i = new Image();
        }


    }

    /*
     * Get available address
     * @param AltAddr is in AltAddr
     * @param cbResuult a callback function that is called with parameter - one of the available url or Err object {"error": {"num":number, "message":string, "note"?:string}}
     * */
    public getAvailAddr(altAddr: string, cbResult): void {

        if (!this.inited) {
            cbResult(Consts.errList["10"]);
            return;
        }

        if (altAddr.substring(0, 5).toLowerCase() !== "aa://") {
            cbResult(Consts.errList["20"]);
            return;
        }
        let aa = altAddr.split("/")[2].toLowerCase();

        switch (this.io.version) {
            case 0: {

                this.checkAddrs(this.rootAddresses, 0, (res: string | Err) => {
                    //console.log(res);
                    if (typeof res == "object" && "error" in res) {
                        cbResult(res);
                    } else {
                        if (this.io.requestMethod == "jsonp") {
                            var elem = document.createElement("script");
                            elem.src = encodeURI(res + "/?altaddr=" + aa + "&jsonp=altaddrlib.jsonpCallback" + "&requestMethod=jsonp");
                            document.head.appendChild(elem);
                            this.tmpFun = cbResult;
                        }
                        else if (this.io.requestMethod == "xhr") {
                            fetch(res + "/?altaddr=" + aa + "&requestMethod=xhr", {mode:"cors"})
                                .then((data) => {return data.json()})
                                .then((data: any) => {
                                    if (data && data.urls) {
                                        var urls = Utils.getRootAddrs(data.urls);
                                        this.checkAddrs(urls, 0, (res: string | Err) => {
                                            cbResult(res);
                                        });
                                    }
                                    else {
                                        cbResult(Consts.errList["31"]);
                                        console.error(data);
                                        return;
                                    }

                                })
                                .catch((error) => {
                                    console.error('L114. Request failed', error);
                                    let e = Consts.errList["40"];
                                    e.error.note = error + "";
                                    cbResult(e);
                                });
                        }
                        else {
                            return cbResult(Consts.errList["12"]);
                        }
                    }
                });

                break;
            }
        }

        //return "###116";

    }

    /*
     * Checks availability of the confirmation files for the addresses recursively
     * @param addrs is array of objects of addresses and confirmation files.
     * @startIndex index of member of addrs.
     * @param cbResuult a callback function that is called with parameter - one of the available url or Err object {"error": {"num":number, "message":string, "note":string}}
     * */
    private checkAddrs(addrs: Addr[], startIndex: number, cbResult: any) {

        if (addrs.length == 0) {
            cbResult(Consts.errList["31"]);
            return;
        }

        let oUrl: URL;
        let url: string;
        try {
            oUrl = new URL(addrs[startIndex].url);
        }
        catch (e) {
            let err: Err = Consts.errList["31"];
            err.error.note = e;
            cbResult(err);
            return;
        }

        url = oUrl.protocol + "//" + oUrl.host + oUrl.pathname + "/" + addrs[startIndex].confirmFileName;
        console.log("Checking " + url);

        //uri = uri.charAt(uri.length - 1) == "/" ? uri + addrs[startIndex].confirmFileName : uri + "/" + addrs[startIndex].confirmFileName;


        this.i.onload = () => {
            cbResult(addrs[startIndex].url);
            return;
        };

        this.i.onerror = () => {

            let err: Err = Consts.errList["30"];
            err.error.note = addrs[startIndex].url;
            console.info(err.error.note + ": " + err.error.message);
            if (startIndex < addrs.length - 1) {
                this.checkAddrs(addrs, startIndex + 1, (res: string | Err) => {
                    cbResult(res);
                })
            }
            else {
                cbResult(err);
            }
        };

        this.i.src = url;

    }

    public jsonpCallback(data: any) {
        if (typeof this.tmpFun == 'function') {
            if (data && data.urls) {
                var urls = Utils.getRootAddrs(data.urls);
                this.checkAddrs(urls, 0, (res: string | Err) => {
                    this.tmpFun(res);
                    this.tmpFun = null;
                });

            }
            else {
                this.tmpFun(Consts.errList["31"]);
                console.error(data);
                this.tmpFun = null;
            }

        }
        else {
            console.error('Callback is not a function');
        }
    }

    private test(p: any) {
        console.log(p);
    }


}

//test by itself
//let aal = new AltAddrLib({version:0, requestMethod:"xhr"});
//aal.getAvailAddr("aa://altaddr",(res:string | Err)=>{});

