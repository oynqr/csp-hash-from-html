{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

  outputs =
    { nixpkgs, ... }:
    let
      forAllSystems =
        function:
        nixpkgs.lib.genAttrs [
          "aarch64-darwin"
          "aarch64-linux"
          "x86_64-linux"
        ] (system: function nixpkgs.legacyPackages.${system});
    in
    {
      devShells = forAllSystems (
        pkgs: with pkgs; {
          default = mkShell {
            nativeBuildInputs = [
              nodejs_25
            ];
          };
        }
      );

      packages = forAllSystems (pkgs: {
        default = pkgs.buildNpmPackage {
          pname = "csp-hash-from-html";
          version = "0.3.1";
          src = ./.;
          npmDepsHash = "sha256-nIZ8VxoM+VHMh8WLthE2RKo9now1UT6ptlAmJ8WU+04=";
        };
      });
    };
}
