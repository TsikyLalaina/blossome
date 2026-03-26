export class MvolaError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly mvolaCode?: string
  ) {
    super(message);
    this.name = 'MvolaError';
  }
}

export function getMvolaUserFacingMessage(error: MvolaError): string {
  switch (error.statusCode) {
    case 400:
      return 'Requête de paiement invalide. Vérifiez le numéro saisi.';
    case 401:
      return 'Erreur d\'authentification avec le service de paiement.';
    case 402:
      return 'Le paiement a échoué. Vérifiez votre solde Mvola.';
    case 403:
      return 'Accès refusé au service de paiement.';
    case 409:
      return 'Une transaction identique est déjà en cours.';
    case 429:
      return 'Trop de tentatives. Veuillez réessayer dans quelques secondes.';
    case 503:
      return 'Le service Mvola est temporairement indisponible. Réessayez dans quelques minutes.';
    default:
      return 'Une erreur de paiement est survenue. Veuillez réessayer.';
  }
}
