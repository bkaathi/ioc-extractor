import { Pool, spawn, Worker } from "threads";
import { QueuedTask } from "threads/dist/master/pool";
import { ModuleThread } from "threads/dist/types/master";

import { refang } from "./aux/auxiliary";
import {
  extractASN,
  extractASNs,
  extractBTC,
  extractBTCs,
  extractCVE,
  extractCVEs,
  extractDomain,
  extractDomains,
  extractEmail,
  extractEmails,
  extractETH,
  extractETHs,
  extractGAPubID,
  extractGAPubIDs,
  extractGATrackID,
  extractGATrackIDs,
  extractIPv4,
  extractIPv4s,
  extractIPv6,
  extractIPv6s,
  extractMacAddress,
  extractMacAddresses,
  extractMD5,
  extractMD5s,
  extractSHA1,
  extractSHA1s,
  extractSHA256,
  extractSHA256s,
  extractSHA512,
  extractSHA512s,
  extractSSDEEP,
  extractSSDEEPs,
  extractURL,
  extractURLs,
  extractXMR,
  extractXMRs,
} from "./aux/extractor";
import { convertToSTIX2, STIX2 } from "./stix2/stix2";
import { Extractor } from "./workers/extractor";

export {
  extractASN,
  extractASNs,
  extractBTC,
  extractBTCs,
  extractCVE,
  extractCVEs,
  extractDomain,
  extractDomains,
  extractEmail,
  extractEmails,
  extractETH,
  extractETHs,
  extractGAPubID,
  extractGAPubIDs,
  extractGATrackID,
  extractGATrackIDs,
  extractIPv4,
  extractIPv4s,
  extractIPv6,
  extractIPv6s,
  extractMacAddress,
  extractMacAddresses,
  extractMD5,
  extractMD5s,
  extractSHA1,
  extractSHA1s,
  extractSHA256,
  extractSHA256s,
  extractSHA512,
  extractSHA512s,
  extractSSDEEP,
  extractSSDEEPs,
  extractURL,
  extractURLs,
  extractXMR,
  extractXMRs,
  refang,
};

export declare interface IOC {
  asns: string[];
  btcs: string[];
  cves: string[];
  domains: string[];
  emails: string[];
  eths: string[];
  gaPubIDs: string[];
  gaTrackIDs: string[];
  ipv4s: string[];
  ipv6s: string[];
  macAddresses: string[];
  md5s: string[];
  sha1s: string[];
  sha256s: string[];
  sha512s: string[];
  ssdeeps: string[];
  urls: string[];
  xmrs: string[];
}

export class IOCExtractor {
  /**
   * Returns an IOC in data
   *
   * @static
   * @param {string} data A string
   * @param {boolean} enableIDN Enable or disable IDN
   * @param {boolean} strictTLD Enable or disable strict TLD validation
   * @returns {IOC}
   * @memberof IOCExtractor
   */
  public static extractIOC(
    data: string,
    enableIDN = true,
    strictTLD = true
  ): IOC {
    const extractor = new IOCExtractor(data);
    return extractor.extractIOC(enableIDN, strictTLD);
  }

  /**
   * Returns an IOC in data in async
   *
   * @static
   * @param {string} data A string
   * @param {boolean} enableIDN Enable or disable IDN extraction
   * @param {boolean} strictTLD Enable or disable strict TLD validation
   * @returns {Promise<IOC>}
   * @memberof IOCExtractor
   */
  public static async extractIOCAsync(
    data: string,
    enableIDN = true,
    strictTLD = true
  ): Promise<IOC> {
    const extractor = new IOCExtractor(data);
    return await extractor.extractIOCAsync(enableIDN, strictTLD);
  }

  /**
   * Alias for extractIOC
   *
   * @deprecated
   * @static
   * @param {string} data
   * @returns {IOC}
   * @memberof IOCExtractor
   */
  public static getIOC(data: string): IOC {
    return this.extractIOC(data);
  }

  private data: string;

  public constructor(data: string) {
    this.data = refang(data);
  }

  /**
   * Returns an IOC of the data
   *
   * @returns {IOC}
   * @param {boolean} enableIDN Enable or disable IDN extraction
   * @param {boolean} strictTLD Enable or disable strict TLD validation
   * @memberof IOCExtractor
   */
  public extractIOC(enableIDN = true, strictTLD = true): IOC {
    const ioc: IOC = {
      asns: extractASNs(this.data),
      btcs: extractBTCs(this.data),
      cves: extractCVEs(this.data),
      domains: extractDomains(this.data, enableIDN, strictTLD),
      emails: extractEmails(this.data, enableIDN, strictTLD),
      eths: extractETHs(this.data),
      gaPubIDs: extractGAPubIDs(this.data),
      gaTrackIDs: extractGATrackIDs(this.data),
      ipv4s: extractIPv4s(this.data),
      ipv6s: extractIPv6s(this.data),
      macAddresses: extractMacAddresses(this.data),
      md5s: extractMD5s(this.data),
      sha1s: extractSHA1s(this.data),
      sha256s: extractSHA256s(this.data),
      sha512s: extractSHA512s(this.data),
      ssdeeps: extractSSDEEPs(this.data),
      urls: extractURLs(this.data, enableIDN, strictTLD),
      xmrs: extractXMRs(this.data),
    };
    return ioc;
  }

  /**
   * Returns an IOC of the data in async
   *
   * @returns {Promise<IOC>}
   * @param {boolean} enableIDN Enable or disable IDN extraction
   * @param {boolean} strictTLD Enable or disable strict TLD validation
   * @memberof IOCExtractor
   */
  public async extractIOCAsync(
    enableIDN = true,
    strictTLD = true
  ): Promise<IOC> {
    const pool = Pool(() =>
      spawn<Extractor>(new Worker("./workers/extractor"))
    );
    const tasks: QueuedTask<ModuleThread<Extractor>, string[]>[] = [];

    const extractASNTask = pool.queue((extractor) =>
      extractor.extractASNs(this.data)
    );
    tasks.push(extractASNTask);

    const extractBTCTask = pool.queue((extractor) =>
      extractor.extractBTCs(this.data)
    );
    tasks.push(extractBTCTask);

    const extractCVETask = pool.queue((extractor) =>
      extractor.extractCVEs(this.data)
    );
    tasks.push(extractCVETask);

    const extractDomainTask = pool.queue((extractor) =>
      extractor.extractDomains(this.data, enableIDN, strictTLD)
    );
    tasks.push(extractDomainTask);

    const extractEmailTask = pool.queue((extractor) =>
      extractor.extractEmails(this.data, enableIDN, strictTLD)
    );
    tasks.push(extractEmailTask);

    const extractETHTask = pool.queue((extractor) =>
      extractor.extractETHs(this.data)
    );
    tasks.push(extractETHTask);

    const extractGAPubIDTask = pool.queue((extractor) =>
      extractor.extractGAPubIDs(this.data)
    );
    tasks.push(extractGAPubIDTask);

    const extractGATrackIDTask = pool.queue((extractor) =>
      extractor.extractGATrackIDs(this.data)
    );
    tasks.push(extractGATrackIDTask);

    const extractIPv4Task = pool.queue((extractor) =>
      extractor.extractIPv4s(this.data)
    );
    tasks.push(extractIPv4Task);

    const extractIPv6Task = pool.queue((extractor) =>
      extractor.extractIPv6s(this.data)
    );
    tasks.push(extractIPv6Task);

    const extractMacAddressTask = pool.queue((extractor) =>
      extractor.extractMacAddresses(this.data)
    );
    tasks.push(extractMacAddressTask);

    const extractMD5Task = pool.queue((extractor) =>
      extractor.extractMD5s(this.data)
    );
    tasks.push(extractMD5Task);

    const extractSHA1Task = pool.queue((extractor) =>
      extractor.extractSHA1s(this.data)
    );
    tasks.push(extractSHA1Task);

    const extractSHA256Task = pool.queue((extractor) =>
      extractor.extractSHA256s(this.data)
    );
    tasks.push(extractSHA256Task);

    const extractSHA512Task = pool.queue((extractor) =>
      extractor.extractSHA512s(this.data)
    );
    tasks.push(extractSHA512Task);

    const extractSSDEEPTask = pool.queue((extractor) =>
      extractor.extractSSDEEPs(this.data)
    );
    tasks.push(extractSSDEEPTask);

    const extractURLTask = pool.queue((extractor) =>
      extractor.extractURLs(this.data, enableIDN, strictTLD)
    );
    tasks.push(extractURLTask);

    const extractXMRTask = pool.queue((extractor) =>
      extractor.extractXMRs(this.data)
    );
    tasks.push(extractXMRTask);

    const results = await Promise.all(tasks);
    await pool.terminate();

    const ioc: IOC = {
      asns: results[0],
      btcs: results[1],
      cves: results[2],
      domains: results[3],
      emails: results[4],
      eths: results[5],
      gaPubIDs: results[6],
      gaTrackIDs: results[7],
      ipv4s: results[8],
      ipv6s: results[9],
      macAddresses: results[10],
      md5s: results[11],
      sha1s: results[12],
      sha256s: results[13],
      sha512s: results[14],
      ssdeeps: results[15],
      urls: results[16],
      xmrs: results[17],
    };

    return ioc;
  }

  /**
   * Alias for getIOC
   * @deprecated
   * @returns {IOC}
   * @memberof IOCExtractor
   */
  public getIOC(): IOC {
    return this.extractIOC();
  }
}

/**
 * Returns an IOC of data
 *
 * @export
 * @param {string} data A string
 * @param {boolean} enableIDN Enable or disable IDN extraction
 * @param {boolean} strictTLD Enable or disable strict TLD validation
 * @returns {IOC}
 */
export function extractIOC(
  data: string,
  enableIDN = true,
  strictTLD = true
): IOC {
  return IOCExtractor.extractIOC(data, enableIDN, strictTLD);
}

/**
 * Returns an IOC of data in async
 *
 * @export
 * @param {string} data A string
 * @param {boolean} enableIDN Enable or disable IDN extraction
 * @param {boolean} strictTLD Enable or disable strict TLD validation
 * @returns {Promise<IOC>}
 */
export async function extractIOCAsync(
  data: string,
  enableIDN = true,
  strictTLD = true
): Promise<IOC> {
  return await IOCExtractor.extractIOCAsync(data, enableIDN, strictTLD);
}

/**
 * Alias for extractIOC
 * @deprecated
 * @export
 * @param {string} data A string
 * @returns {IOC}
 */
export function getIOC(data: string): IOC {
  return extractIOC(data);
}

/**
 * Returns an IOC of data as STIX2 format
 *
 * @export
 * @param {string} data
 * @param {boolean} enableIDN Enable or disable IDN extraction
 * @param {boolean} strictTLD Enable or disable strict TLD validation
 * @returns {STIX2}
 */
export function extractSTIX2(
  data: string,
  enableIDN = true,
  strictTLD = true
): STIX2 {
  const ioc = extractIOC(data, enableIDN, strictTLD);
  return convertToSTIX2(ioc);
}

/**
 * Returns an IOC of data as STIX2 format in async
 *
 * @export
 * @param {string} data
 * @param {boolean} enableIDN Enable or disable IDN extraction
 * @param {boolean} strictTLD Enable or disable strict TLD validation
 * @returns {Promise<STIX2>}
 */
export async function extractSTIX2Async(
  data: string,
  enableIDN = true,
  strictTLD = true
): Promise<STIX2> {
  const ioc = await extractIOCAsync(data, enableIDN, strictTLD);
  return convertToSTIX2(ioc);
}

/**
 * Alias for extractSTIX2
 * @deprecated
 * @export
 * @param {string} data
 * @returns {STIX2}
 */
export function getSTIX2(data: string): STIX2 {
  return extractSTIX2(data);
}
