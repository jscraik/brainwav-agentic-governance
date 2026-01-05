#!/usr/bin/env bash
# Bash completion for brainwav-governance CLI
# Source this file in your .bashrc or .bash_profile:
#   source /path/to/completion.bash
# Or copy to /etc/bash_completion.d/ or ~/.local/share/bash-completion/completions/

_brainwav_governance() {
    local cur prev words cword
    _init_completion || return

    local commands="init install upgrade validate doctor cleanup-plan spec task packs loop"
    local global_flags="--help --version --root --config --quiet --verbose --debug --json --plain --no-color --no-input --apply --report --output"
    local common_flags="--mode --profile --packs --dry-run --yes --force --no-install --strict"

    case "${prev}" in
        --root|--config|--report|--output)
            _filedir
            return
            ;;
        --mode)
            COMPREPLY=($(compgen -W "pointer full" -- "${cur}"))
            return
            ;;
        --profile)
            COMPREPLY=($(compgen -W "creative delivery release" -- "${cur}"))
            return
            ;;
        --packs)
            local packs="sdd ts-base react-vite tailwind storybook cloudflare-workers swift-core swift-xcode swift-appkit swift-spm apple-release mcp-server-ts agent-loop mcp-aegis docs preset:web preset:edge preset:mcp preset:apple"
            COMPREPLY=($(compgen -W "${packs}" -- "${cur}"))
            return
            ;;
        --tier)
            COMPREPLY=($(compgen -W "feature fix refactor research update" -- "${cur}"))
            return
            ;;
        --compat)
            COMPREPLY=($(compgen -W "speckit" -- "${cur}"))
            return
            ;;
        spec)
            COMPREPLY=($(compgen -W "init validate clarify analyze checklist" -- "${cur}"))
            return
            ;;
        task)
            COMPREPLY=($(compgen -W "init" -- "${cur}"))
            return
            ;;
        packs)
            COMPREPLY=($(compgen -W "list" -- "${cur}"))
            return
            ;;
        loop)
            COMPREPLY=($(compgen -W "run" -- "${cur}"))
            return
            ;;
    esac

    if [[ "${cur}" == -* ]]; then
        COMPREPLY=($(compgen -W "${global_flags} ${common_flags}" -- "${cur}"))
        return
    fi

    # Check if a command has been given
    local cmd_found=0
    for word in "${words[@]}"; do
        if [[ " ${commands} " == *" ${word} "* ]]; then
            cmd_found=1
            break
        fi
    done

    if [[ ${cmd_found} -eq 0 ]]; then
        COMPREPLY=($(compgen -W "${commands}" -- "${cur}"))
    fi
}

complete -F _brainwav_governance brainwav-governance
complete -F _brainwav_governance brainwav-agentic-governance
complete -F _brainwav_governance amyga
