package com.kob_backend_seoin.kob_backend.dto.Network;

import java.util.List;

public class NetworkResponseDto {
    private List<NetworkNodeDto> nodes;
    private List<NetworkConnectionDto> connections;
    private NetworkStatsDto stats;

    public NetworkResponseDto() {}

    public NetworkResponseDto(List<NetworkNodeDto> nodes, List<NetworkConnectionDto> connections, NetworkStatsDto stats) {
        this.nodes = nodes;
        this.connections = connections;
        this.stats = stats;
    }

    public List<NetworkNodeDto> getNodes() { return nodes; }
    public void setNodes(List<NetworkNodeDto> nodes) { this.nodes = nodes; }

    public List<NetworkConnectionDto> getConnections() { return connections; }
    public void setConnections(List<NetworkConnectionDto> connections) { this.connections = connections; }

    public NetworkStatsDto getStats() { return stats; }
    public void setStats(NetworkStatsDto stats) { this.stats = stats; }
}