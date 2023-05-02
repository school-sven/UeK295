export class Security {
  /*
  Hint: Diese Anpassung behebt ein potenzielles Sicherheitsproblem,
  bei dem unbefugter Zugriff auf die Benutzerdaten möglich ist.
  Durch diese Korrektur wird sichergestellt, dass nur authentifizierte
  Benutzer auf die sensiblen Daten zugreifen können. Ebenfalls kann man sich
  nicht mit einem von einer anderen Applikation generiertem Token anmelden (sofern
  das JWT Secret in beiden Applikationen nicht gleich ist).
   */
  static get secret() {
    return (
      process.env.JWT_SECRET ||
      'rhenweiun89fdsaASDFcibz=0-9u8y7t6r5e4w3q2!@#$%^&*()_+dsu87=0-9u8y7t6r5e4w3q2!@#$%^&*()_+dsu87'
    );
  }
}
