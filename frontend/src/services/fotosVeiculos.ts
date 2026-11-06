type FotoVeiculo = {
  arquivo: string;
  autor: string;
  fonte: string;
  licenca: "CC BY-SA 4.0" | "CC0 1.0";
};

const fotosPorModelo: Readonly<Record<string, FotoVeiculo>> = {
  "bugatti chiron super sport": {
    arquivo: "bugatti-chiron-super-sport.jpg",
    autor: "MrWalkr",
    fonte: "https://commons.wikimedia.org/wiki/File:Bugatti_Chiron_Super_Sport.jpg",
    licenca: "CC BY-SA 4.0",
  },
  "ferrari daytona sp3": {
    arquivo: "ferrari-daytona-sp3.jpg",
    autor: "TTTNIS",
    fonte: "https://commons.wikimedia.org/wiki/File:2024_Ferrari_Daytona_SP3.jpg",
    licenca: "CC0 1.0",
  },
  "lamborghini sián fkp 37": {
    arquivo: "lamborghini-sian-fkp-37.jpg",
    autor: "MrWalkr",
    fonte: "https://commons.wikimedia.org/wiki/File:2022_Lamborghini_FKP_37_Sian.jpg",
    licenca: "CC BY-SA 4.0",
  },
  "porsche 918 spyder": {
    arquivo: "porsche-918-spyder.jpg",
    autor: "MrWalkr",
    fonte: "https://commons.wikimedia.org/wiki/File:Silver_Porsche_918_Spyder.jpg",
    licenca: "CC BY-SA 4.0",
  },
  "koenigsegg jesko attack": {
    arquivo: "koenigsegg-jesko-attack.jpg",
    autor: "Calreyn88",
    fonte: "https://commons.wikimedia.org/wiki/File:2024_Koenigsegg_Jesko_Attack.jpg",
    licenca: "CC BY-SA 4.0",
  },
};

export function buscarFotoVeiculo(marca: string, modelo: string): FotoVeiculo | undefined {
  return fotosPorModelo[`${marca} ${modelo}`.trim().replace(/\s+/g, " ").toLowerCase()];
}

export const licencasFotos = {
  "CC BY-SA 4.0": "https://creativecommons.org/licenses/by-sa/4.0/",
  "CC0 1.0": "https://creativecommons.org/publicdomain/zero/1.0/",
};
