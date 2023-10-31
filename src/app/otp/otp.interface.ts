interface GenerateOptions {
  digits?: boolean;
  lowerCaseAlphabets?: boolean;
  upperCaseAlphabets?: boolean;
  specialChars?: boolean;
}

export interface OtpOptions {
  length: number;
  generateOptions?: GenerateOptions;
}
