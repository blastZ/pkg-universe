export class BuiltInFunctions {
  static trim(v: any) {
    return String(v).trim();
  }

  static lowercase(v: any) {
    return String(v).toLowerCase();
  }

  static uppercase(v: any) {
    return String(v).toUpperCase();
  }

  static length(v: any) {
    return Array.isArray(v) ? v.length : String(v).length;
  }

  static capitalize(v: any) {
    const str = String(v);

    const strList = str.split(' ');

    return strList
      .map((o) => o.slice(0, 1).toUpperCase() + o.slice(1))
      .join(' ');
  }
}
