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
          npmDepsHash = "sha256-yML1N35BRg2QvC1fmUdeBrLG+PMhOpgUiZZw+wq/01Y=";
          doCheck = true;
          checkPhase = "npm test";
        };
      });
    };
}
